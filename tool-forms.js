const pointTypes = [
  ["home", "⌂ บ้าน/ครัวเรือน"],
  ["member", "♙ สมาชิกชุมชน (ใช้รหัส/นามสมมติ)"],
  ["temple", "☸ วัด/ศาสนสถาน"],
  ["school", "▣ โรงเรียน/ศูนย์การเรียนรู้"],
  ["health", "✚ หน่วยบริการสุขภาพ"],
  ["market", "▤ ตลาด/ร้านค้า"],
  ["water", "≈ แหล่งน้ำ"],
  ["group", "⌘ องค์กร/กลุ่มชุมชน"],
  ["public", "✳ พื้นที่สาธารณะ"],
  ["other", "• อื่น ๆ"]
];

export const formSchemas = {
  "community-mapping": {
    notice: "พิกัดและบ้านเลขที่อาจระบุตัวบุคคลได้ บันทึกเฉพาะเมื่อได้รับอนุญาตจากเจ้าของสถานที่หรือผู้ให้ข้อมูล",
    fields: [
      { name: "pointType", label: "สัญลักษณ์/ประเภทจุด", type: "select", required: true, options: pointTypes },
      { name: "placeName", label: "บ้านเลขที่/รหัสบุคคลหรือชื่อสถานที่", type: "text", required: true, maxLength: 120, placeholder: "เช่น บ้านเลขที่ 12 ศูนย์ชุมชน หรือรหัสสมาชิก" },
      { name: "details", label: "รายละเอียด", type: "textarea", maxLength: 1000, placeholder: "ทรัพยากรหรือข้อมูลสำคัญของจุดสำรวจ" },
      { name: "latitude", label: "ละติจูด", type: "hidden", required: true },
      { name: "longitude", label: "ลองจิจูด", type: "hidden", required: true },
      { name: "locationConsent", label: "ยืนยันว่าได้รับอนุญาตให้บันทึกตำแหน่งนี้", type: "checkbox", required: true }
    ]
  },
  genogram: {
    notice: "ใช้รหัสหรือนามสมมติแทนชื่อจริง และใช้ช่วงอายุแทนอายุ/วันเกิด ห้ามบันทึกข้อมูลวินิจฉัยหรือเลขประจำตัว",
    fields: [
      { name: "householdCode", label: "รหัสครัวเรือน", type: "text", required: true, maxLength: 40 },
      { name: "memberCode", label: "รหัสสมาชิก/นามสมมติ", type: "text", required: true, maxLength: 60 },
      { name: "generation", label: "รุ่นในครอบครัว", type: "select", required: true, options: [["1", "รุ่นที่ 1"], ["2", "รุ่นที่ 2"], ["3", "รุ่นที่ 3"], ["4", "รุ่นที่ 4"], ["5", "รุ่นที่ 5 หรือมากกว่า"]] },
      { name: "relationship", label: "ความสัมพันธ์กับบุคคลอ้างอิง", type: "select", required: true, options: [["self", "บุคคลอ้างอิง"], ["spouse", "คู่สมรส/คู่ชีวิต"], ["parent", "บิดา/มารดา"], ["child", "บุตร"], ["sibling", "พี่น้อง"], ["grandparent", "ปู่/ย่า/ตา/ยาย"], ["grandchild", "หลาน"], ["relative", "ญาติอื่น ๆ"]] },
      { name: "ageRange", label: "ช่วงอายุ", type: "select", required: true, options: [["0-12", "0–12 ปี"], ["13-17", "13–17 ปี"], ["18-29", "18–29 ปี"], ["30-59", "30–59 ปี"], ["60+", "60 ปีขึ้นไป"], ["unknown", "ไม่ระบุ"]] },
      { name: "gender", label: "เพศ (ถ้าจำเป็น)", type: "select", options: [["", "ไม่ระบุ"], ["female", "หญิง"], ["male", "ชาย"], ["other", "อื่น ๆ"]] },
      { name: "notes", label: "หมายเหตุที่จำเป็น", type: "textarea", maxLength: 500 },
      { name: "consent", label: "ยืนยันว่าได้รับความยินยอม และใช้รหัสแทนข้อมูลระบุตัวบุคคล", type: "checkbox", required: true }
    ]
  },
  organization: {
    notice: "บันทึกข้อมูลกลุ่ม/องค์กร หลีกเลี่ยงข้อมูลติดต่อส่วนบุคคลหากไม่จำเป็น",
    fields: [
      { name: "groupName", label: "ชื่อกลุ่ม/องค์กร", type: "text", required: true, maxLength: 120 },
      { name: "groupType", label: "ประเภท", type: "select", required: true, options: [["community", "กลุ่มชุมชน"], ["government", "หน่วยงานรัฐ"], ["health", "หน่วยบริการสุขภาพ"], ["education", "การศึกษา"], ["civil", "ภาคประชาสังคม"], ["business", "ธุรกิจ/วิสาหกิจ"], ["other", "อื่น ๆ"]] },
      { name: "role", label: "บทบาท/หน้าที่ในชุมชน", type: "text", required: true, maxLength: 160 },
      { name: "relatedGroups", label: "กลุ่มที่ทำงานเชื่อมโยง", type: "text", maxLength: 300 },
      { name: "summary", label: "รายละเอียด/กิจกรรม", type: "textarea", maxLength: 1500 }
    ]
  },
  "community-health": {
    notice: "บันทึกเฉพาะภาพรวมของบริการและทรัพยากร ห้ามกรอกชื่อผู้ป่วย เลขประจำตัว การวินิจฉัย หรือข้อมูลสุขภาพรายบุคคล",
    fields: [
      { name: "resourceType", label: "ประเภทข้อมูล", type: "select", required: true, options: [["facility", "หน่วยบริการ"], ["resource", "ทรัพยากร/อุปกรณ์"], ["workforce", "บุคลากร (จำนวนรวมเท่านั้น)"], ["activity", "กิจกรรมส่งเสริมสุขภาพ"], ["referral", "ระบบส่งต่อ"], ["other", "อื่น ๆ"]] },
      { name: "resourceName", label: "ชื่อหน่วยบริการ/ทรัพยากร/กิจกรรม", type: "text", required: true, maxLength: 140 },
      { name: "quantity", label: "จำนวนหรือขีดความสามารถ (ภาพรวม)", type: "number", min: 0, max: 1000000 },
      { name: "unit", label: "หน่วย", type: "text", maxLength: 40, placeholder: "เช่น แห่ง, คน, ครั้ง" },
      { name: "area", label: "พื้นที่/ชุมชน", type: "text", maxLength: 120 },
      { name: "details", label: "รายละเอียด", type: "textarea", maxLength: 1500 }
    ]
  },
  "community-calendar": {
    notice: "ตรวจสอบวัน เวลา และสถานที่ก่อนบันทึก และหลีกเลี่ยงข้อมูลติดต่อส่วนบุคคล",
    fields: [
      { name: "title", label: "ชื่อกิจกรรม/เหตุการณ์", type: "text", required: true, maxLength: 140 },
      { name: "eventType", label: "ประเภทกิจกรรม", type: "select", required: true, options: [["tradition", "ประเพณี/วัฒนธรรม"], ["meeting", "ประชุม"], ["health", "สุขภาพ"], ["education", "การศึกษา"], ["environment", "สิ่งแวดล้อม"], ["other", "อื่น ๆ"]] },
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
      { name: "eventType", label: "หมวดหมู่", type: "select", options: [["origin", "การก่อตั้งชุมชน"], ["culture", "วัฒนธรรม/ประเพณี"], ["development", "การพัฒนา"], ["person", "บุคคล/กลุ่มสำคัญ"], ["disaster", "เหตุการณ์สำคัญ"], ["other", "อื่น ๆ"]] },
      { name: "story", label: "รายละเอียด/เรื่องราว", type: "textarea", required: true, maxLength: 3000 },
      { name: "source", label: "แหล่งที่มา/เอกสารอ้างอิง", type: "text", maxLength: 300 },
      { name: "permission", label: "ยืนยันว่าได้รับอนุญาตให้บันทึกและใช้ข้อมูลนี้", type: "checkbox", required: true }
    ]
  },
  "life-history": {
    notice: "ใช้รหัสหรือนามสมมติ ไม่บันทึกข้อมูลติดต่อหรือข้อมูลสุขภาพส่วนบุคคล และต้องได้รับความยินยอมจากผู้ให้ข้อมูลก่อนบันทึก",
    fields: [
      { name: "participantCode", label: "รหัสผู้ให้ข้อมูล/นามสมมติ", type: "text", required: true, maxLength: 60 },
      { name: "lifePeriod", label: "ช่วงวัย/ช่วงเวลา", type: "text", required: true, maxLength: 100, placeholder: "เช่น วัยเด็ก หรือ พ.ศ. 2520–2530" },
      { name: "headline", label: "หัวข้อเหตุการณ์", type: "text", required: true, maxLength: 140 },
      { name: "story", label: "เรื่องเล่า/ประสบการณ์", type: "textarea", required: true, maxLength: 4000 },
      { name: "source", label: "แหล่งที่มา (ถ้ามี)", type: "text", maxLength: 300 },
      { name: "consent", label: "ยืนยันว่าได้รับความยินยอมจากผู้ให้ข้อมูล และใช้ชื่อสมมติหรือรหัสแทนตัวตน", type: "checkbox", required: true }
    ]
  }
};

export function getFieldOptions(name) {
  return pointTypes.find(([value]) => value === name)?.[1] || name;
}
