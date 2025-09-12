import axios from "axios";
import FormData from "form-data";

const API = "https://nova.astrometry.net/api";

export async function solveWithAstrometry(buffer) {
  const { data: login } = await axios.post(`${API}/login`, { apikey: process.env.ASTROMETRY_KEY });
  const form = new FormData();
  form.append("request-json", JSON.stringify({ session: login.session }));
  form.append("file", buffer, { filename: "sky.jpg" });
  const { data: up } = await axios.post(`${API}/upload`, form, { headers: form.getHeaders() });

  let jobId = null;
  for (let i = 0; i < 30; i++) {
    const { data } = await axios.get(`${API}/submissions/${up.subid}`);
    if (Array.isArray(data.jobs) && data.jobs[0]) { jobId = data.jobs[0]; break; }
    await new Promise(r => setTimeout(r, 2000));
  }
  if (!jobId) throw new Error("Astrometry jobId timeout");

  for (let i = 0; i < 40; i++) {
    const { data: job } = await axios.get(`${API}/jobs/${jobId}`);
    if (job.status === "success") {
      const { data: calib } = await axios.get(`${API}/jobs/${jobId}/calibration`);
      return calib; 
    }
    if (job.status === "failure") throw new Error("Astrometry failed");
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error("Astrometry calibration timeout");
}
