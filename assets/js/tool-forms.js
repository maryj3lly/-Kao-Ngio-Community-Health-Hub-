export const formSchemas = {
  "community-mapping": {
    notice: "พิกัดบ้านและข้อมูลสุขภาพเป็นข้อมูลอ่อนไหว ใช้รหัส/ข้อมูลภาพรวม ขอความยินยอม และกรอกจำนวนผู้ป่วยเฉพาะเมื่อได้รับอนุญาต",
    fields: [
      { name: "placeName", label: "ชื่อสถานที่/รหัสครัวเรือน", type: "text", required: true, maxLength: 120 },
      { name: "pointType", label: "ประเภทสถานที่/สัญลักษณ์", type: "select", required: true, options: [["home", "บ้าน/ครัวเรือน"], ["member", "สมาชิกชุมชน (ใช้รหัส/นามสมมติ)"], ["temple", "วัด/ศาสนสถาน"], ["school", "โรงเรียน/ศูนย์การเรียนรู้"], ["health", "หน่วยบริการสุขภาพ"], ["market", "ตลาด/ร้านค้า"], ["water", "แหล่งน้ำ"], ["group", "องค์กร/กลุ่มชุมชน"], ["public", "พื้นที่สาธารณะ"], ["other", "อื่น ๆ"]] },
      { name: "village", label: "หมู่บ้าน", type: "text", maxLength: 120 },
      { name: "details", label: "รายละเอียด", type: "textarea", maxLength: 1000 },
      { name: "latitude", label: "ละติจูด", type: "hidden", required: true },
      { name: "longitude", label: "ลองจิจูด", type: "hidden", required: true },
      { name: "chronicConditions", label: "โรคประจำตัวที่พบ (ข้อมูลภาพรวม)", type: "text", maxLength: 250 },
      { name: "diabeticCount", label: "จำนวนผู้ป่วยเบาหวาน", type: "number", min: 0, max: 1000000 },
      { name: "hypertensionCount", label: "จำนวนผู้ป่วยความดันโลหิตสูง", type: "number", min: 0, max: 1000000 },
      { name: "heartDiseaseCount", label: "จำนวนผู้ป่วยโรคหัวใจ", type: "number", min: 0, max: 1000000 },
      { name: "kidneyDiseaseCount", label: "จำนวนผู้ป่วยโรคไต", type: "number", min: 0, max: 1000000 },
      { name: "strokeCount", label: "จำนวนผู้ป่วยโรคหลอดเลือดสมอง", type: "number", min: 0, max: 1000000 },
      { name: "otherConditionCount", label: "จำนวนผู้ป่วยโรคอื่น ๆ", type: "number", min: 0, max: 1000000 },
      { name: "homeboundCount", label: "จำนวนผู้ป่วยติดบ้าน", type: "number", min: 0, max: 1000000 },
      { name: "bedriddenCount", label: "จำนวนผู้ป่วยติดเตียง", type: "number", min: 0, max: 1000000 },
      { name: "disabilityCount", label: "จำนวนผู้พิการ", type: "number", min: 0, max: 1000000 },
      { name: "elderlyCount", label: "จำนวนผู้สูงอายุ", type: "number", min: 0, max: 1000000 },
      { name: "youngChildCount", label: "จำนวนเด็กเล็ก", type: "number", min: 0, max: 1000000 },
      { name: "surveyDate", label: "วันที่สำรวจ", type: "date" },
      { name: "locationConsent", label: "ยืนยันว่าได้รับอนุญาตให้บันทึกตำแหน่งและข้อมูลนี้", type: "checkbox", required: true }
    ]
  },
  genogram: {
    notice: "ใช้รหัสหรือนามสมมติแทนชื่อจริง หลีกเลี่ยงวันเกิดที่แน่นอนหากไม่จำเป็น และห้ามบันทึกข้อมูลวินิจฉัยหรือเลขประจำตัว",
    fields: [
      { name: "householdCode", label: "รหัสครัวเรือน", type: "text", required: true, maxLength: 40 },
      { name: "memberCode", label: "รหัสสมาชิก/นามสมมติ", type: "text", required: true, maxLength: 60 },
      { name: "relationship", label: "ความสัมพันธ์กับบุคคลอ้างอิง", type: "select", required: true, options: [["self", "บุคคลอ้างอิง"], ["spouse", "คู่สมรส/คู่ชีวิต"], ["parent", "บิดา/มารดา"], ["child", "บุตร"], ["sibling", "พี่น้อง"], ["grandparent", "ปู่/ย่า/ตา/ยาย"], ["grandchild", "หลาน"], ["relative", "ญาติอื่น ๆ"]] },
      { name: "birthDate", label: "วันเกิด (ไม่บังคับ)", type: "date" },
      { name: "notes", label: "หมายเหตุที่จำเป็น", type: "textarea", maxLength: 500 },
      { name: "consent", label: "ยืนยันว่าได้รับความยินยอม และใช้รหัสแทนข้อมูลระบุตัวบุคคล", type: "checkbox", required: true }
    ]
  },
  organization: {
    notice: "บันทึกข้อมูลกลุ่ม/องค์กร หลีกเลี่ยงข้อมูลติดต่อส่วนบุคคลหากไม่จำเป็น",
    fields: [
      { name: "groupName", label: "ชื่อกลุ่ม/องค์กร", type: "text", required: true, maxLength: 120 },
      { name: "groupType", label: "ประเภท", type: "select", required: true, options: [["community", "กลุ่มชุมชน"], ["government", "หน่วยงานรัฐ"], ["health", "หน่วยบริการสุขภาพ"], ["education", "การศึกษา"], ["civil", "ภาคประชาสังคม"], ["business", "ธุรกิจ/วิสาหกิจ"], ["other", "อื่น ๆ"]] },
      { name: "contactPerson", label: "ผู้ประสานงาน", type: "text", maxLength: 120 },
      { name: "phone", label: "เบอร์ติดต่อ (ถ้าจำเป็น)", type: "tel", maxLength: 40 },
      { name: "village", label: "หมู่บ้าน", type: "text", maxLength: 120 },
      { name: "summary", label: "รายละเอียด/กิจกรรม", type: "textarea", maxLength: 1500 }
    ]
  },
  "community-health": {
    notice: "บันทึกข้อมูลบริการ/ทรัพยากรหรือข้อมูลภาพรวมเท่านั้น ใช้รหัสสมมติ ห้ามกรอกชื่อผู้ป่วย เลขประจำตัว หรือข้อมูลวินิจฉัยรายบุคคล",
    fields: [
      { name: "personCode", label: "รหัสบุคคล/รหัสสมมติ (ไม่บังคับ)", type: "text", maxLength: 60 },
      { name: "resourceName", label: "ชื่อรายการ", type: "text", required: true, maxLength: 140 },
      { name: "resourceType", label: "ประเภทข้อมูล", type: "select", required: true, options: [["facility", "หน่วยบริการ"], ["resource", "ทรัพยากร/อุปกรณ์"], ["workforce", "บุคลากร (จำนวนรวมเท่านั้น)"], ["activity", "กิจกรรมส่งเสริมสุขภาพ"], ["referral", "ระบบส่งต่อ"], ["other", "อื่น ๆ"]] },
      { name: "details", label: "รายละเอียด", type: "textarea", maxLength: 1500 }
    ]
  },
  "community-calendar": {
    notice: "ตรวจสอบวัน เวลา และสถานที่ก่อนบันทึก และหลีกเลี่ยงข้อมูลติดต่อส่วนบุคคล",
    fields: [
      { name: "title", label: "ชื่อกิจกรรม/เหตุการณ์", type: "text", required: true, maxLength: 140 },
      { name: "date", label: "วันที่", type: "date", required: true },
      { name: "place", label: "สถานที่", type: "text", maxLength: 160 },
      { name: "responsibleGroup", label: "กลุ่มผู้รับผิดชอบ", type: "text", maxLength: 120 },
      { name: "details", label: "รายละเอียด", type: "textarea", maxLength: 1500 }
    ]
  },
  "community-history": {
    notice: "แยกข้อเท็จจริงจากความทรงจำ ระบุแหล่งที่มา และขออนุญาตก่อนบันทึกหรือเผยแพร่เรื่องเล่าหรือเอกสาร",
    fields: [
      { name: "title", label: "ชื่อเหตุการณ์/เรื่องราว", type: "text", required: true, maxLength: 160 },
      { name: "period", label: "ปีหรือช่วงเวลา", type: "text", required: true, maxLength: 80, placeholder: "เช่น พ.ศ. 2520 หรือช่วง พ.ศ. 2500–2510" },
      { name: "story", label: "รายละเอียด/เรื่องราว", type: "textarea", required: true, maxLength: 3000 },
      { name: "source", label: "แหล่งที่มา/เอกสารอ้างอิง", type: "text", maxLength: 300 },
      { name: "permission", label: "ยืนยันว่าได้รับอนุญาตให้บันทึกและใช้ข้อมูลนี้", type: "checkbox", required: true }
    ]
  },
  "life-history": {
    notice: "ใช้รหัสหรือนามสมมติ ไม่บันทึกข้อมูลติดต่อหรือข้อมูลสุขภาพส่วนบุคคล และต้องได้รับความยินยอมจากผู้ให้ข้อมูลก่อนบันทึก",
    fields: [
      { name: "participantCode", label: "รหัสผู้ให้ข้อมูล/นามสมมติ", type: "text", required: true, maxLength: 60 },
      { name: "headline", label: "หัวข้อเหตุการณ์", type: "text", required: true, maxLength: 140 },
      { name: "story", label: "เรื่องเล่า/ประสบการณ์", type: "textarea", required: true, maxLength: 4000 },
      { name: "consent", label: "ยืนยันว่าได้รับความยินยอมจากผู้ให้ข้อมูล และใช้ชื่อสมมติหรือรหัสแทนตัวตน", type: "checkbox", required: true }
    ]
  },
  households: {
    notice: "ใช้รหัสหรือชื่อเรียกครัวเรือนที่ไม่เปิดเผยข้อมูลส่วนบุคคล และบันทึกจำนวนสมาชิกเท่านั้น",
    fields: [
      { name: "householdName", label: "ชื่อ/รหัสครัวเรือน", type: "text", required: true, maxLength: 120 },
      { name: "village", label: "หมู่บ้าน", type: "text", required: true, maxLength: 120 },
      { name: "memberCount", label: "จำนวนสมาชิก", type: "number", required: true, min: 0, max: 1000 },
      { name: "details", label: "รายละเอียด", type: "textarea", maxLength: 1500 },
      { name: "consent", label: "ยืนยันว่าได้รับอนุญาตให้บันทึกข้อมูลครัวเรือนนี้", type: "checkbox", required: true }
    ]
  }
};
