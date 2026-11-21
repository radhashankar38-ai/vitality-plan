import fetch from "node-fetch";

async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/health-insights");
    console.log("STATUS:", res.status);
    console.log("JSON:", await res.json());
  } catch(e) {
    console.error(e);
  }
}
run();
