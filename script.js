// CONFIGURATION
// IMPORTANT: Replace this URL with your actual Google Apps Script Web App URL after deployment
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyZhF6Kmul3SVVxTdQwBhWA6_S0y9i1iVRhw2sHOkemenfFxVQGOoYhACxnT3umA2CzuQ/exec"; 

function openTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => c.classList.remove('active'));
    
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => b.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Handle Leave Form Submission
document.getElementById('leaveForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm(this, 'leave');
});

// Handle Swap Form Submission
document.getElementById('swapForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    submitForm(this, 'swap');
});

async function submitForm(form, type) {
    if (WEB_APP_URL.includes("YOUR_DEPLOYED")) {
        Swal.fire('Configuration Error', 'กรุณาอัปเดต WEB_APP_URL ในไฟล์ script.js ก่อนใช้งาน', 'error');
        return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Add Metadata
    data.action = 'submit_request';
    data.requestType = type === 'leave' ? data.leaveType : 'สลับวันหยุด';

    Swal.fire({
        title: 'กำลังส่งข้อมูล...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        // Use 'no-cors' if you just want to fire and forget, but we need response.
        // GAS Web App must be set to "Anyone" access to allow CORS.
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            Swal.fire('สำเร็จ', 'ส่งคำขอเรียบร้อยแล้ว', 'success');
            form.reset();
        } else {
            Swal.fire('เกิดข้อผิดพลาด', result.message, 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
    }
}

async function fetchHistory() {
    const empId = document.getElementById('historyEmpId').value;
    if (!empId) {
        Swal.fire('แจ้งเตือน', 'กรุณากรอกรหัสพนักงาน', 'warning');
        return;
    }

    const list = document.getElementById('historyList');
    list.innerHTML = '<p style="text-align:center;">กำลังโหลด...</p>';

    try {
        const response = await fetch(`${WEB_APP_URL}?action=get_status&employeeId=${empId}`);
        const result = await response.json();

        if (result.status === 'success' && result.data.length > 0) {
            list.innerHTML = result.data.map(item => `
                <div class="history-item status-${item.status}">
                    <strong>${item.type}</strong> - ${item.status} <br>
                    <small>${new Date(item.timestamp).toLocaleString()}</small><br>
                    <span style="color:#666;">${item.detail}</span>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<p style="text-align:center;">ไม่พบประวัติคำขอ</p>';
        }
    } catch (error) {
        list.innerHTML = '<p style="text-align:center; color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}
