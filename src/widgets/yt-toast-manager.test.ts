import { html, fixture, expect } from "@open-wc/testing";
import { ToastNotificationEvent } from "./events.js";
import { YtToastManager } from "./yt-toast-manager.js";
import { YtToast } from "./yt-toast.js";
import "./yt-toast-manager.js";
import "./yt-toast.js";

describe("YtToastManager", () => {
  it("enqueues toast when ToastNotificationEvent is dispatched", async () => {
    const el = await fixture<YtToastManager>(
      html`<yt-toast-manager></yt-toast-manager>`,
    );

    window.dispatchEvent(
      new ToastNotificationEvent({
        message: "Notification arrived",
        type: "info",
        durationMs: 0,
      }),
    );

    await el.updateComplete;

    const toast = el.shadowRoot!.querySelector("yt-toast") as YtToast;
    expect(toast).to.exist;
    expect(toast.message).to.equal("Notification arrived");
  });
});
