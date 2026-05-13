import{j as e}from"./framer-DxRPei5x.js";import{c as f}from"./index-BjZvkB6s.js";import{r as m}from"./router-eBfzQVqH.js";import{B as h}from"./button-DNfMQF3K.js";import{C as g}from"./credit-card-BZht7Dd-.js";import{P as u}from"./printer-BT0MeirH.js";import"./react-j2mp3VYR.js";import"./radix-CUqhDY3k.js";import"./charts-k-z5h9__.js";import"./utils-DAFsUNkJ.js";import"./createLucideIcon-BqaWq8r4.js";const x="/assets/card-front.png",b="/assets/card-back.png",p=[{id:1,nameAr:"أحمد محمد علي",memberId:"MEM-001",sport:"كرة القدم",endDate:"31/12/2025"},{id:2,nameAr:"محمد علي حسن",memberId:"MEM-002",sport:"سباحة",endDate:"31/12/2025"},{id:3,nameAr:"كريم أحمد سعيد",memberId:"MEM-003",sport:"تنس",endDate:"30/06/2025"}],l=a=>String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");function v(a,t){return`<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>HUC — بطاقة العضوية</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800&display=swap');
    @page { size: 8.56cm 5.4cm landscape; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; font-family: "Cairo", Arial, sans-serif; }
    .page { min-height: 100vh; display: grid; place-items: center; }

    /* CR-80 card */
    .card {
      width: 8.56cm; height: 5.4cm;
      overflow: hidden; direction: ltr;
      display: grid; grid-template-columns: 3.2cm 1fr;
      position: relative;
    }
    /* Left: card front image fills the panel */
    .left { position: relative; overflow: hidden; }
    .left img { width: 100%; height: 100%; object-fit: cover; display: block; }

    /* Right: white info area */
    .right {
      padding: 8px 10px;
      background: #fff;
      position: relative;
      display: flex; flex-direction: column; justify-content: center;
    }
    .info { display: flex; flex-direction: column; gap: 8px; }
    .field-value { font-size: 7.5pt; font-weight: 700; color: #111; line-height: 1.3; }

    .sig {
      position: absolute; bottom: 5px; right: 8px;
      text-align: right; font-size: 6.5pt; font-weight: 800; color: #111; line-height: 1.3;
    }

    @media print {
      .page { background: transparent; padding: 0; }
      .card { box-shadow: none; margin: 0; }
    }
  </style>
</head>
<body class="page">
  <div class="card">
    <aside class="left">
      <img src="${t}" alt="card front" />
    </aside>
    <section class="right">
      <div class="info" dir="rtl">
        <div class="field-value">الاسم : ${l(a.nameAr)}</div>
        <div class="field-value">رقم العضوية : ${l(a.memberId)}</div>
        <div class="field-value">النشاط : ${l(a.sport)}</div>
        <div class="field-value">ساري حتى : ${l(a.endDate)}</div>
      </div>
      <div class="sig" dir="rtl">
        <div>المدير التنفيذي</div>
        <div>ا.د / احمد فاروق</div>
      </div>
    </section>
  </div>
</body>
</html>`}async function w(a){const d=await(await fetch(x)).blob(),o=await new Promise(i=>{const c=new FileReader;c.onload=()=>i(c.result),c.readAsDataURL(d)}),r=document.createElement("iframe");Object.assign(r.style,{position:"fixed",right:"0",bottom:"0",width:"0",height:"0",border:"0"}),document.body.appendChild(r);const s=r.contentWindow.document;s.open(),s.write(v(a,o)),s.close(),await new Promise(i=>{if(s.readyState==="complete"){i();return}r.contentWindow.addEventListener("load",()=>i(),{once:!0})}),r.contentWindow.focus(),r.contentWindow.print(),r.contentWindow.onafterprint=()=>setTimeout(()=>document.body.removeChild(r),50),setTimeout(()=>{document.body.contains(r)&&document.body.removeChild(r)},5e3)}function n(a){const t=f.c(7),{label:d,value:o}=a;let r;t[0]!==d?(r=e.jsx("span",{className:"text-sm text-muted-foreground",children:d}),t[0]=d,t[1]=r):r=t[1];let s;t[2]!==o?(s=e.jsx("span",{className:"text-sm font-semibold",children:o}),t[2]=o,t[3]=s):s=t[3];let i;return t[4]!==r||t[5]!==s?(i=e.jsxs("div",{className:"flex justify-between items-center py-2 border-b border-border last:border-0",children:[r,s]}),t[4]=r,t[5]=s,t[6]=i):i=t[6],i}function D(){const[a,t]=m.useState(p[0]),[d,o]=m.useState(!1),r=async()=>{o(!0);try{await w(a)}finally{o(!1)}};return e.jsxs("div",{className:"h-full flex",dir:"rtl",children:[e.jsxs("div",{className:"w-72 shrink-0 border-l border-border flex flex-col",children:[e.jsxs("div",{className:"px-4 py-4 border-b border-border shrink-0",children:[e.jsxs("h2",{className:"text-base font-bold flex items-center gap-2",children:[e.jsx(g,{className:"h-4 w-4 text-primary"}),"قائمة الأعضاء"]}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:"اختر عضواً لمعاينة بطاقته"})]}),e.jsx("div",{className:"flex-1 overflow-y-auto p-2 space-y-1",children:p.map(s=>e.jsxs("button",{onClick:()=>t(s),className:`w-full text-right rounded-lg border px-4 py-3 transition-all duration-150 ${a.id===s.id?"border-primary bg-primary text-primary-foreground shadow-sm":"border-border bg-card hover:bg-muted/50"}`,children:[e.jsx("p",{className:"font-semibold text-sm leading-tight",children:s.nameAr}),e.jsxs("p",{className:`text-xs mt-0.5 ${a.id===s.id?"text-primary-foreground/75":"text-muted-foreground"}`,children:[s.sport," · ",s.memberId]})]},s.id))})]}),e.jsxs("div",{className:"flex-1 overflow-y-auto p-8 space-y-8",children:[e.jsxs("div",{className:"space-y-3",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"نموذج البطاقة"}),e.jsxs("div",{className:"flex flex-wrap gap-6",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("p",{className:"text-xs text-muted-foreground text-center",children:"الوجه الأمامي"}),e.jsx("img",{src:x,alt:"card front",className:"max-w-[360px] rounded-xl shadow-md border border-border"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("p",{className:"text-xs text-muted-foreground text-center",children:"الوجه الخلفي"}),e.jsx("img",{src:b,alt:"card back",className:"max-w-[360px] rounded-xl shadow-md border border-border"})]})]})]}),e.jsxs("div",{className:"max-w-sm space-y-2",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"بيانات العضو المختار"}),e.jsxs("div",{className:"rounded-xl border border-border bg-card px-4 py-1",children:[e.jsx(n,{label:"الاسم",value:a.nameAr}),e.jsx(n,{label:"الرياضة",value:a.sport}),e.jsx(n,{label:"رقم العضو",value:a.memberId}),e.jsx(n,{label:"تاريخ الانتهاء",value:a.endDate})]})]}),e.jsxs("div",{children:[e.jsxs(h,{onClick:()=>void r(),disabled:d,className:"gap-2",size:"lg",children:[e.jsx(u,{className:"h-4 w-4"}),d?"جارٍ الإعداد...":"طباعة البطاقة"]}),e.jsx("p",{className:"text-xs text-muted-foreground mt-2",children:"تأكد من اختيار: الطابعة MagicCard Rio Pro 360 · حجم الورق CR80 · الهوامش: بدون"})]})]})]})}export{D as default};
