import { io, S } from "../helpers.js";
export default {
  build(root) {
    root.innerHTML = `<style>
      .s-closing{display:grid;place-items:center;background:radial-gradient(ellipse at 50% 45%,#fff 0,#f4f8fc 68%);font-family:var(--font);color:#173553;text-align:center}
      .s-closing .box{padding:64px 110px;border:1px solid #e1eaf2;border-radius:34px;background:#fff;box-shadow:0 34px 90px rgba(23,53,83,.11)}
      .s-closing .mark{display:grid;place-items:center;width:70px;height:70px;margin:0 auto 28px;border-radius:20px;background:linear-gradient(145deg,#176fba,#26a3d8);color:#fff;font-size:40px;font-weight:800}
      .s-closing h1{font-size:63px;line-height:1.12;letter-spacing:-2px}.s-closing h1 span{color:#176fba}.s-closing p{margin-top:20px;color:#617991;font-size:23px}
      .s-closing .foot{margin-top:38px;color:#8295a8;font-size:15px;font-weight:700;letter-spacing:1.5px}
    </style><div class="box"><div class="mark">E</div><h1>ERNet <span>Training Dashboard</span></h1><p>Phases, participation, and location progress</p><div class="foot">SCHOOLNET INDIA LIMITED</div></div>`;
    this.content=root.firstElementChild;
  },
  render(root,lt){const p=io(lt,.15,1.3);S(this.content,{opacity:p,transform:`translateY(${(1-p)*20}px) scale(${.985+.015*p})`});}
};
