import { io, S } from "../helpers.js";
export default {
  build(root) {
    root.innerHTML = `<style>
      .s-opener{display:grid;place-items:center;background:radial-gradient(ellipse at 50% 45%,#fff 0,#f4f8fc 67%);font-family:var(--font);color:#173553}
      .s-opener .title{font-size:84px;line-height:1.05;font-weight:800;letter-spacing:-3px;text-align:center;max-width:1400px}
      .s-opener .title span{display:block;color:#176fba}.s-opener .sub{margin-top:28px;font-size:27px;color:#617991;text-align:center}
      .s-opener .mark{display:grid;place-items:center;width:74px;height:74px;margin:0 auto 34px;border-radius:22px;background:linear-gradient(145deg,#176fba,#26a3d8);color:#fff;font-size:42px;font-weight:800;box-shadow:0 18px 45px #176fba38}
      .s-opener .eyebrow{margin-top:42px;color:#8295a8;font-size:16px;font-weight:700;letter-spacing:2px;text-align:center;text-transform:uppercase}
    </style><div><div class="mark">E</div><div class="title">Training progress,<span>in one clear view.</span></div><div class="sub">ERNet Training Dashboard</div><div class="eyebrow">16 states · sample dashboard data</div></div>`;
    this.content=root.firstElementChild;
  },
  render(root,lt){const p=io(lt,.2,1.4);S(this.content,{opacity:p,transform:`translateY(${(1-p)*22}px)`});}
};
