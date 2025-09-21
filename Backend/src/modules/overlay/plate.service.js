import axios from "axios";
import FormData from "form-data";

const API = process.env.ASTROMETRY_BASE_URL || "https://nova.astrometry.net/api";
const RETRY = { tries: 2, gap: 1500 };
const POLL_MS = Number(process.env.ASTROMETRY_POLL_INTERVAL_MS || 2000);
const JOBID_POLLS = Number(process.env.ASTROMETRY_JOB_ID_MAX_POLLS || 60);
const JOB_POLLS = Number(process.env.ASTROMETRY_JOB_MAX_POLLS || 120);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function solveWithAstrometry(buffer) {
  if (!process.env.ASTROMETRY_KEY) {
    throw new Error("Astrometry API key missing (ASTROMETRY_KEY)");
  }

  const client = axios.create({ baseURL: API, timeout: 30000 });
  
  const { data: login } = await client.post(`/login`, { 
    apikey: process.env.ASTROMETRY_KEY 
  });
  
  if (!login?.session) {
    throw new Error("Astrometry login failed (no session)");
  }

  let hints = {};
  if (process.env.ASTROMETRY_HINTS) {
    try {
      hints = JSON.parse(process.env.ASTROMETRY_HINTS);
    } catch {}
  }

  for (let attempt = 1; attempt <= RETRY.tries; attempt++) {
    try {
      const form = new FormData();
      form.append("request-json", JSON.stringify({
        session: login.session,
        ...hints
      }));
      form.append("file", buffer, { filename: "sky.jpg" });
      
      const { data: up } = await client.post(`/upload`, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      
      if (!up || (up.status && up.status !== "success") || typeof up.subid === "undefined") {
        throw new Error("Astrometry upload failed (no subid)");
      }

      let jobId = null;
      await sleep(POLL_MS);
      
      for (let i = 0; i < JOBID_POLLS; i++) {
        const { data } = await client.get(`/submissions/${up.subid}`);
        if (Array.isArray(data.jobs)) {
          const j = data.jobs.find(Boolean);
          if (j) {
            jobId = j;
            break;
          }
        }
        await sleep(POLL_MS);
      }
      
      if (!jobId) throw new Error("Astrometry jobId timeout");

      for (let i = 0; i < JOB_POLLS; i++) {
        const { data: job } = await client.get(`/jobs/${jobId}`);
        
        if (job?.status === "success") {
          const { data: calib } = await client.get(`/jobs/${jobId}/calibration`);
          
          if (!("ra" in calib) || !("dec" in calib) || !("rotation" in calib) || !("pixscale" in calib)) {
            throw new Error("Calibration missing fields");
          }
          
          return calib;
        }
        
        if (job?.status === "failure") {
          throw new Error("Astrometry failed");
        }
        
        await sleep(POLL_MS);
      }
      
      throw new Error("Astrometry calibration timeout");
    } catch (e) {
      if (attempt === RETRY.tries) throw e;
      await sleep(RETRY.gap);
    }
  }
  
  throw new Error("Astrometry unreachable");
}
