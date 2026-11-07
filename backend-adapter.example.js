/*
 * ตัวอย่างจุดเชื่อมต่อ Backend ในอนาคต
 *
 * 1) สร้าง Supabase project ของหน่วยงาน
 * 2) ออกแบบ schema และ Row Level Security (RLS) ก่อนเปิดรับข้อมูลจริง
 * 3) ใช้เฉพาะ publishable/anon key ใน frontend และเปิด RLS ทุกตาราง
 * 4) ห้ามใส่ service_role key, password หรือ secret ใด ๆ ในไฟล์นี้
 * 5) ข้อมูลสุขภาพและข้อมูลระบุตัวบุคคลต้องมีมาตรการคุ้มครองที่เหมาะสม
 *
 * ไฟล์นี้เป็นเพียงโครงร่าง ไม่เชื่อมต่อฐานข้อมูลและไม่บันทึกข้อมูล
 */

export function createBackendAdapter() {
  return {
    isConfigured: false,
    async listTools() {
      throw new Error("Backend ยังไม่ได้ตั้งค่า — prototype นี้ยังไม่มีฐานข้อมูล");
    },
    async saveRecord() {
      throw new Error("ยังไม่เปิดใช้งานการบันทึกข้อมูล");
    }
  };
}
