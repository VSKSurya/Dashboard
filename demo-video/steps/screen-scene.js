import { clamp, io, lerp, S } from "../helpers.js";

export function screenScene({ image, afterImage = null, imageTop = 0, focus = null, mode = "screen" }) {
  const safeImage = image.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const safeAfterImage = afterImage?.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  return {
    build(root) {
      root.innerHTML = `
        <style>
          .s-${mode}{font-family:var(--font);color:var(--ink);}
          .s-${mode} .browser-shell{position:absolute;left:160px;top:108px;width:1600px;height:840px;overflow:hidden;border:1px solid #d7e3ee;border-radius:22px;background:#fff;box-shadow:0 38px 90px rgba(23,53,83,.24);}
          .s-${mode} .browser-bar{position:absolute;z-index:2;left:0;right:0;top:0;height:42px;display:flex;align-items:center;gap:8px;padding:0 16px;background:#f1f5f9;border-bottom:1px solid #e2e9ef;}
          .s-${mode} .browser-bar i{width:11px;height:11px;border-radius:50%;background:#ff6159;}.s-${mode} .browser-bar i:nth-child(2){background:#ffbd2e}.s-${mode} .browser-bar i:nth-child(3){background:#28c840}
          .s-${mode} .address{height:25px;margin-left:16px;padding:4px 16px;border-radius:7px;background:#fff;color:#71839a;font-size:13px;}
          .s-${mode} .screen-clip{position:absolute;left:0;right:0;top:42px;bottom:0;overflow:hidden;background:#f4f8fc;}
          .s-${mode} .screen-img{position:absolute;left:0;width:1600px;height:auto;max-width:none;}
          .s-${mode} .screen-img.after{opacity:0;}
          .s-${mode} .label{position:absolute;right:160px;top:32px;color:#173553;font-weight:700;font-size:20px;letter-spacing:.2px;}
          .s-${mode} .tag{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border:1px solid #dce8f2;border-radius:999px;background:#fff;box-shadow:0 8px 24px rgba(23,53,83,.1)}
          .s-${mode} .tag b{color:#176fba}.s-${mode} .ring{position:absolute;border:3px solid #2d91df;border-radius:18px;box-shadow:0 0 0 7px rgba(45,145,223,.12),0 12px 34px rgba(45,145,223,.18);pointer-events:none;}
        </style>
        <div class="browser-shell"><div class="browser-bar"><i></i><i></i><i></i><span class="address">ernet-training-dashboard / dashboard</span></div>
          <div class="screen-clip"><img class="screen-img before" src="${safeImage}" alt="Real ERNet training dashboard screenshot">${safeAfterImage ? `<img class="screen-img after" src="${safeAfterImage}" alt="Real ERNet training dashboard with Student selected">` : ""}</div>
          ${focus ? '<div class="ring"></div>' : ''}
        </div>
        <div class="label"><span class="tag"><b>ERNet</b> ${mode === "audience" ? "Teacher and Student views" : mode === "phases" ? "Phase wise Training" : "Location Performance"}</span></div>`;
      this.img = root.querySelector(".screen-img");
      this.afterImg = root.querySelector(".screen-img.after");
      this.ring = root.querySelector(".ring");
      this.focus = focus;
      this.imageTop = imageTop;
    },
    render(root, lt) {
      const enter = io(lt, .15, 1.35);
      S(root.querySelector(".browser-shell"), { opacity: clamp(enter), transform: `translateY(${(1-enter)*18}px) scale(${.985 + .015*enter})` });
      S(this.img, { top: lerp(this.imageTop + 22, this.imageTop, enter) + "px" });
      if (this.afterImg) {
        S(this.afterImg, { top: lerp(this.imageTop + 22, this.imageTop, enter) + "px", opacity: io(lt, 3.0, 3.8) });
      }
      if (this.ring && this.focus) {
        const p = io(lt, 2.0, 2.8);
        S(this.ring, { left: this.focus.x + "px", top: this.focus.y + "px", width: this.focus.w + "px", height: this.focus.h + "px", opacity: p, transform: `scale(${.97 + .03*p})` });
      }
      S(root.querySelector(".label"), { opacity: io(lt, 1.1, 1.8), transform: `translateY(${(1-io(lt,1.1,1.8))*8}px)` });
    }
  };
}
