const raw = "```json\n{ \"test\": 1 }\n```";
let planStrRaw = raw.trim();
if (planStrRaw.startsWith('```json')) {
  planStrRaw = planStrRaw.substring(7);
  if (planStrRaw.endsWith('```')) {
    planStrRaw = planStrRaw.substring(0, planStrRaw.length - 3);
  }
} else if (planStrRaw.startsWith('```')) {
  planStrRaw = planStrRaw.substring(3);
  if (planStrRaw.endsWith('```')) {
    planStrRaw = planStrRaw.substring(0, planStrRaw.length - 3);
  }
}
console.log(JSON.parse(planStrRaw.trim()));
