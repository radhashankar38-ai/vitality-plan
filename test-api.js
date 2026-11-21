import fetch from "node-fetch";

async function run() {
  try {
    const res = await fetch("http://localhost:3000/api/generate-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: 30, weight: 80, height: 180, unit: "metric", preference: "cardio"
      })
    });
    console.log("STATUS:", res.status);
    console.log("JSON:", await res.json());
  } catch(e) {
    console.error(e);
  }
}
run();
