import React, { useRef } from "react";
import "./MemberShip-Form.css"; // This should match the styles you pasted

const MembershipForm = React.forwardRef((props, ref) => {
  return (
    <div className="form-container" ref={ref}>
      <div className="overlay"></div>
      {/* Header */}
      <div className="header-first-part">
        {/* <button type="button" onClick={() => window.print()}> */}
        {/* <img src="/ClubCard/Logos/Button.svg" alt="Print Button" /> */}

        {/* </button> */}
      </div>

      <div className="header-sec-part">
        <div className="value-input-group">
          {/* <img src="/ClubCard/Logos/Text field.svg" alt="" className="cost" /> */}
          <label>قيمة الإستمارة</label>
          <span>250</span>
        </div>
        <img src="/ClubCard/Logos/logo.PNG" alt="HUC Logo" />
      </div>

      <div className="text-center">
        <h2 className="section-title">إستمارة عضوية</h2>
      </div>

      {/* Form Section */}
      <div className="form-section-main">
        <div className="image-placeholder">صورة</div>
        <div className="form-inputs-right">
          <div className="form-group">
            <input type="text" id="name" name="name" />
            <label htmlFor="name">:الإسم</label>
          </div>
          <div className="form-group">
            <input type="text" id="dob" name="dob" />
            <label htmlFor="dob"> :تاريخ الميلاد</label>
          </div>
          <div className="form-group">
            <input type="text" id="type" name="type" />
            <label htmlFor="type">:النوع</label>
          </div>
          <div className="form-group">
            <input type="text" id="address" name="address" />
            <label htmlFor="address">:العنوان</label>
          </div>
          <div className="form-group radio-group">
            <label>
              <input type="radio" name="marital_status" value="أعزب" /> أعزب
            </label>
            <label>
              <input type="radio" name="marital_status" value="متزوج/متزوجة" />{" "}
              متزوج / متزوجة
            </label>
            <label>
              <input type="radio" name="marital_status" value="أرمل/أرملة" />{" "}
              أرمل / أرملة
            </label>
            <label>
              <input type="radio" name="marital_status" value="مطلق/مطلقة" />{" "}
              مطلق / مطلقة
            </label>
            <label>:الحالة الإجتماعية</label>
          </div>
          <div className="form-group">
            <input type="text" id="profession" name="profession" />
            <label htmlFor="profession">:المهنة</label>
          </div>
          <div className="form-group">
            <input type="text" id="phone" name="phone" />
            <label htmlFor="phone">:الهاتف واتس اب</label>
          </div>
        </div>
      </div>

      {/* Declaration Section */}
      <div className="declaration-section">
        <h4>إقرار</h4>
        <div className="declaration-text">
          أقر أنا <input type="text" className="inline-input" /> برقم قومي{" "}
          <input type="text" className="inline-input" /> بأن البيانات الواردة في
          هذه الاستمارة صحيحة علي مسؤوليتي الشخصية مع الالتزام بالقانون الرياضي
          المصري ولائحة النظام الأساسي لأندية الشركات والمصانع و الوزارات
          والمصالح الحكومية ووحدات الإدارة المحلية والهيئات العامة وأجهزة الدولة
          و سلطاتها واللائحة الملاحقة وتعديلاتها
          <div className="declaration-date-right">تحريراً في / / ٢٠م</div>
        </div>
        <div className="signature-area">
          <div className="signature-item">
            <label htmlFor="report_what">:المقرر بما فيه </label>
            <input type="text" id="report_what" name="report_what" />
          </div>
          <div className="signature-item">
            <label htmlFor="signature_name">:الإسم</label>
            <input type="text" id="signature_name" name="signature_name" />
          </div>
          <div className="signature-item">
            <label htmlFor="signature">:التوقيع</label>
            <input type="text" id="signature" name="signature" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default MembershipForm;
