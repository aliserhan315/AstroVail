import axios from "axios";
import FormData from "form-data";

const API = "https://nova.astrometry.net/api";
const RETRY = { tries: 2, gap: 1500 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function solveWithAstrometry(buffer) {
  const { data: login } = await axios.post(`${API}/login`, { apikey: process.env.ASTROMETRY_KEY });

  for (let attempt = 1; attempt <= RETRY.tries; attempt++) {
    try {
      const form = new FormData();
      form.append("request-json", JSON.stringify({ session: login.session }));
      form.append("file", buffer, { filename: "sky.jpg" });

      const { data: up } = await axios.post(`${API}/upload`, form, { headers: form.getHeaders() });

      let jobId = null;
      for (let i = 0; i < 30; i++) {
        const { data } = await axios.get(`${API}/submissions/${up.subid}`);
        if (Array.isArray(data.jobs) && data.jobs[0]) { jobId = data.jobs[0]; break; }
        await sleep(2000);
      }
      if (!jobId) throw new Error("Astrometry jobId timeout");

      for (let i = 0; i < 40; i++) {
        const { data: job } = await axios.get(`${API}/jobs/${jobId}`);
        if (job.status === "success") {
          const { data: calib } = await axios.get(`${API}/jobs/${jobId}/calibration`);
          if (!("ra" in calib) || !("dec" in calib) || !("rotation" in calib) || !("pixscale" in calib)) {
            throw new Error("Calibration missing fields");
          }
          return calib;
        }
        if (job.status === "failure") throw new Error("Astrometry failed");
        await sleep(2000);
      }
      throw new Error("Astrometry calibration timeout");
    } catch (e) {
      if (attempt === RETRY.tries) throw e;
      await sleep(RETRY.gap);
    }
  }
  throw new Error("Astrometry unreachable");
}