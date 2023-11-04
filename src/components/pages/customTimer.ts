import gradient from "../generic/gradient";
import "./custom-timer.css";

const customTimerEl = document.querySelector<HTMLDivElement>(".custom-timer")!;
const deleteButtonEl = document.querySelector<HTMLButtonElement>(
  ".custom-timer__delete-button"
)!;
const numberButtonEls = document.querySelectorAll<HTMLButtonElement>(
  ".custom-timer__number-button"
);
const startButtonEl = document.querySelector<HTMLButtonElement>(
  ".custom-timer__start-button"
)!;
const timeDisplayEl = document.querySelector<HTMLOutputElement>(
  ".custom-timer__time-display"
)!;

const numberToText = (n: number): string => `${n < 600 ? "0" : ""}${n / 60}m`;

let customTimerTime = 0;

const handleNumberInput = (n: number): void => {
  if (n !== 0) deleteButtonEl.disabled = startButtonEl.disabled = false;
  if (customTimerTime >= 600) return;
  customTimerTime = customTimerTime * 10 + n * 60;
  timeDisplayEl.value = numberToText(customTimerTime);
};

const handleBackspace = () => {
  if (customTimerTime < 600) {
    customTimerTime = 0;
    deleteButtonEl.disabled = startButtonEl.disabled = true;
  } else {
    customTimerTime = Math.floor(customTimerTime / 600) * 60;
  }
  timeDisplayEl.value = numberToText(customTimerTime);
};

deleteButtonEl.onclick = handleBackspace;

for (let i = 0; i < numberButtonEls.length; i++) {
  const numberButtonEl = numberButtonEls[i];
  const n = Number(numberButtonEl.getAttribute("data-val"));
  numberButtonEl.onclick = () => handleNumberInput(n);
}

customTimerEl.addEventListener("animationend", () => {
  if (customTimerEl.classList.contains("custom-timer--transition-in")) {
    customTimerEl.classList.remove("custom-timer--transition-in");
  } else if (
    customTimerEl.classList.contains("custom-timer--transition-out-left") ||
    customTimerEl.classList.contains("custom-timer--transition-out-right") ||
    customTimerEl.classList.contains("custom-timer--transition-out-zoom")
  ) {
    timeDisplayEl.value = numberToText((customTimerTime = 0));
    deleteButtonEl.disabled = startButtonEl.disabled = true;
    customTimerEl.classList.add("page--hidden");
    customTimerEl.classList.remove("custom-timer--transition-out-left");
    customTimerEl.classList.remove("custom-timer--transition-out-right");
    customTimerEl.classList.remove("custom-timer--transition-out-zoom");
  }
});

export enum CustomTimerTransitionTypes {
  zoom,
  left,
  right,
}

let isListeningToKeys = false;

class CustomTimer {
  constructor() {
    startButtonEl.onclick = () => this.onStart();
  }

  public get time(): number {
    return customTimerTime;
  }

  public transitionIn() {
    gradient.setGradient(4);
    customTimerEl.classList.remove("page--hidden");
    customTimerEl.classList.remove("custom-timer--transition-out-left");
    customTimerEl.classList.remove("custom-timer--transition-out-right");
    customTimerEl.classList.remove("custom-timer--transition-out-zoom");
    customTimerEl.classList.add("custom-timer--transition-in");
    isListeningToKeys = true;
  }

  public transitionOut(type: CustomTimerTransitionTypes) {
    isListeningToKeys = false;
    customTimerEl.classList.remove("custom-timer--transition-in");
    switch (type) {
      case CustomTimerTransitionTypes.left:
        customTimerEl.classList.add("custom-timer--transition-out-left");
        return;
      case CustomTimerTransitionTypes.right:
        customTimerEl.classList.add("custom-timer--transition-out-right");
        return;
      default:
        customTimerEl.classList.add("custom-timer--transition-out-zoom");
    }
  }

  public onStart() {
    // empty
  }
}

const customTimer = new CustomTimer();

document.onkeydown = (e) => {
  if (!isListeningToKeys) return;
  const { keyCode } = e;
  if (keyCode >= 48 && keyCode <= 57) {
    handleNumberInput(keyCode - 48);
  } else if (keyCode === 8 || keyCode === 46) {
    handleBackspace();
  } else if (keyCode === 13 || keyCode === 32) {
    customTimer.onStart();
  }
};

export default customTimer;
