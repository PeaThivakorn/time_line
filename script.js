// ⚠️ สำคัญ: เปลี่ยน URL ด้านล่างให้เป็น URL ของ Apps Script ที่คุณ Deploy ล่าสุด
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxLMpkCCIfmIUgn0XLofmyJmUJ6GecwRhs_ICkFtflNejBRkAIQxZahxtQYt7u5JaIKgA/exec";

function openTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => c.classList.remove('active'));
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Handle Forms
document.getElementById('leaveForm')?.addEventListener('submit', function (e) {
    e.preventDefault(); submitForm(this, 'leave');
});
document.getElementById('swapForm')?.addEventListener('submit', function (e) {
    e.preventDefault(); submitForm(this, 'swap');
});

async function submitForm(form, type) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.action = 'submit_request';
    data.requestType = type === 'leave' ? data.leaveType : 'สลับวันหยุด';

    Swal.fire({ title: 'กำลังส่งข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
        const response = await fetch(WEB_APP_URL, { method: 'POST', body: JSON.stringify(data) });
        const result = await response.json();
        if (result.status === 'success') {
            Swal.fire('สำเร็จ', 'ส่งคำขอเรียบร้อยแล้ว', 'success');
            form.reset();
        } else {
            Swal.fire('เกิดข้อผิดพลาด', result.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
    }
}

// --- Fetch History Logic ---
async function fetchHistory() {
    const empId = document.getElementById('historyEmpId').value;
    if (!empId) { Swal.fire('แจ้งเตือน', 'กรุณากรอกรหัสพนักงาน', 'warning'); return; }

    const list = document.getElementById('historyList');
    list.innerHTML = '<p style="text-align:center;">กำลังโหลด...</p>';

    try {
        const response = await fetch(`${WEB_APP_URL}?action=get_status&employeeId=${empId}`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            list.innerHTML = result.data.map(item => {
                let dateInfo = "";
                if (item.changeFrom && item.changeTo) {
                    dateInfo = `เปลี่ยนจาก ${formatThaiDate(item.changeFrom)} เป็น ${formatThaiDate(item.changeTo)}`;
                } else {
                    dateInfo = `${formatThaiDate(item.startDate)} ถึง ${formatThaiDate(item.endDate)}`;
                }

                return `
                <div class="history-card status-${item.status}">
                    <div class="history-header">
                        <h3>${item.type}</h3>
                    </div>
                    <div class="history-detail">
                        <p><strong>เลขที่คำขอ:</strong> ${item.requestId}</p>
                        <p><strong>ส่งเมื่อ:</strong> ${item.timestamp}</p>
                        <p><strong>พนักงาน:</strong> ${item.employeeName}</p>
                        <p><strong>รายละเอียด:</strong> ${item.detail}</p>
                        <p><strong>วันที่:</strong> ${dateInfo}</p>
                        <p><strong>สถานะปัจจุบัน:</strong> <span class="text-${item.status}">${item.status}</span></p>
                    </div>
                </div>`;
            }).join('');
        } else {
            list.innerHTML = '<p style="text-align:center;">ไม่พบประวัติคำขอ</p>';
        }
    } catch (error) {
        list.innerHTML = '<p style="text-align:center; color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

function formatThaiDate(dateString) {
    if(!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
}