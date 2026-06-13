// PrintForm.jsx
import React, { useState, useRef } from "react";
// import "./MemberShip-Form.css";

export default function PrintableFormpage({ data }) {
  // Default data if none provided
  const defaultData = {
    cost: "250",
    logoUrl: "/ClubCard/Logos/logo.PNG",
    photoUrl: "/ClubCard/Logos/avatar.jpeg",
    name: "أحمد محمد عمر",
    dob: "1980-05-12",
    type: "عضو تابع",
    address: "القاهرة",
    maritalStatus: "متزوج/متزوجة",
    profession: "مهندس برمجيات",
    phone: "01012345678",
    declarantName: "أحمد محمد",
    declarantId: "12345678901234",
    declarationDate: "تحريراً في 01/01/2025",
    reportWhat: "المقرر ...",
    signatureName: "أحمد محمد",
    signature: "توقيع",
  };

  const cfg = { ...defaultData, ...data };

  // Build the full HTML string
  const getFormHTML = (d) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>استمارة عضوية</title>
  <!-- Adjust this path if you place the CSS elsewhere -->
  <link rel="stylesheet" href="/css/MemberShip-Form.css"/>
  <style>
    .form-container { position: relative; padding: 40px; max-width: 800px; margin: auto; background: white; }
    .overlay { position:absolute; top:0; left:0; width:100%; height:100%; background: url('${
      d.logoUrl
    }') center/contain no-repeat; opacity:0.1; }
    h2.section-title { text-align:center; margin:20px 0; font-size:1.6rem; }
    .header-sec-part { display:flex; justify-content:space-between; align-items:center; }
    .value-input-group { text-align:right; }
    .value-input-group .label { font-weight:600; }
    .value-input-group .value { display:inline-block; margin-left:8px; }
    .photo-section { text-align:center; margin:20px 0; }
    .photo-img { width:150px; height:180px; object-fit:cover;  }
    .fields-wrapper { margin:20px 0; }
    .field { display:flex; justify-content:space-between; margin:8px 0; }
    .field .label { width:150px; text-align:right; font-weight:500; }
    .field .value { flex:1; text-align:center; border-bottom:1px dashed #999; padding-bottom:2px; }
    .radio-value { text-align:center; border-bottom:1px dashed #999; padding-bottom:2px; }
    .section-subtitle { margin-top:30px; font-size:1.2rem; text-align:center; }
    .declaration-text { margin:15px 0; line-height:1.5; }
    .declaration-date-right { text-align:right; margin-top:10px; }
    .signature-area { margin-top:20px; }
    .signature-item { display:flex; justify-content:space-between; margin:8px 0; }
    .signature-item .label { width:150px; text-align:right; font-weight:500; }
    .signature-item .value { flex:1; text-align:center; border-bottom:1px dashed #999; padding-bottom:2px; }
    @media print {
      body, html { margin:0; padding:0; }
      .form-container { box-shadow:none; }
    }
  </style>
</head>
<body>
  <div class="form-container">
    <div class="overlay"></div>

    <div class="header-sec-part">
      <div class="value-input-group">
        <span class="label">قيمة الإستمارة</span>
        <span class="value">${d.cost}</span>
      </div>
      <img src="${d.logoUrl}" alt="Logo" style="height:80px;" />
    </div>

    <h2 class="section-title">إستمارة عضوية</h2>

    <div class="photo-section">
      ${
        d.photoUrl
          ? `<img src="${d.photoUrl}" class="photo-img"/>`
          : `<div class="photo-img">صورة</div>`
      }
    </div>

    <div class="fields-wrapper">
      ${[
        ["الإسم", d.name],
        ["تاريخ الميلاد", d.dob],
        ["النوع", d.type],
        ["العنوان", d.address],
      ]
        .map(
          ([lbl, val]) => `
        <div class="field">
          <span class="label">${lbl}</span>
          <span class="value">${val || "—"}</span>
        </div>
      `
        )
        .join("")}


      ${[
        ["المهنة", d.profession],
        ["الهاتف واتس اب", d.phone],
      ]
        .map(
          ([lbl, val]) => `
        <div class="field">
          <span class="label">${lbl}</span>
          <span class="value">${val || "—"}</span>
        </div>
      `
        )
        .join("")}
    </div>

    <h4 class="section-subtitle">إقرار</h4>
    <div class="declaration-text">
      <p>أقر أنا <strong>${d.name}</strong> برقم قومي <strong>${
    d.declarantId
  }</strong> بأن البيانات الواردة صحيحة على مسؤوليتي الشخصية.</p>
<p class="declaration-date-right">
  بتاريخ :
  ${new Date().toLocaleDateString("en-GB")} 
  ${new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })}
</p>

    </div>

    <div class="signature-area">
      ${[
        ["المقرر بما فيه", d.reportWhat],
        ["الإسم", d.signatureName],
        ["التوقيع", d.signature],
      ]
        .map(
          ([lbl, val]) => `
        <div class="signature-item">
          <span class="label">${lbl}</span>
          <span class="value">${""}</span>
        </div>
      `
        )
        .join("")}
    </div>

 <div class="footer" style="margin-top:40px; text-align:center; font-size:0.9rem;">
  <p>
    ${
      d.editedBy
        ? `تم تعديل البيانات من قبل: <strong>${d.editedBy || "—"}</strong>`
        : `<strong>${d.name}</strong> قام بتسجيل هذه البيانات`
    }
  </p>
</div>
  </div>

  <script>
    window.onload = () => {
      window.print();
      window.onafterprint = () => window.close();
    };
  </script>
</body>
</html>
`;

  const iframeRef = useRef();

  const handlePrint = () => {
    const iframe = iframeRef.current;
    const doc = iframe.contentWindow.document;
    const cardHtml = getFormHTML(cfg);
    doc.open();
    doc.write(cardHtml);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      // iframe.contentWindow.print();
    };
  };

  // const handlePrint = () => {
  //     const html = getFormHTML(cfg);
  //     const w = window.open('', '_blank');
  //     if (!w) return;
  //     w.document.open();
  //     w.document.write(html);
  //     w.document.close();
  // };

  return (
    <div
      style={{ padding: "1rem", border: "1px solid #ccc" }}
      className="border rounded rounded-3"
    >
      <h3>Member Card</h3>
      <ol>
        <li>
          options {">"} printer {"("}Destination{")"} {">"} Printer
        </li>
        <li>
          options {">"} orintaion {">"} portrait
        </li>
        <li>
          options {">"} paper size {">"} A4
        </li>
        <li>
          options {">"} margins {">"} Default
        </li>
      </ol>
      <button onClick={handlePrint} className="btn btn-success">
        Print
      </button>
      <div style={{ display: "none" }}>
        <iframe ref={iframeRef} id="printFrame" title="Print Frame" />
      </div>
    </div>
  );
}
