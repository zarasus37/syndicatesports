const AGE_KEY = "syndicate.age.v1";

export function loadAgeOk() {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(AGE_KEY) === "21";
  } catch {
    return false;
  }
}

export function saveAgeOk() {
  try {
    localStorage.setItem(AGE_KEY, "21");
  } catch {
    /* quota */
  }
}

export function clearAge() {
  try {
    localStorage.removeItem(AGE_KEY);
  } catch {
    /* quota */
  }
}
