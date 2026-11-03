const ERROR_MESSAGES = {
    1: 'Bạn đã từ chối quyền truy cập vị trí. Hãy cho phép truy cập vị trí trong cài đặt trình duyệt.',
    2: 'Không xác định được vị trí hiện tại.',
    3: 'Lấy vị trí quá thời gian cho phép, vui lòng thử lại.'
};

export const getCurrentPosition = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ định vị (yêu cầu HTTPS hoặc localhost).'));
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
        }),
        (err) => reject(new Error(ERROR_MESSAGES[err.code] || 'Không lấy được vị trí.')),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
});

export const formatLocation = (loc) => `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)} (±${loc.accuracy} m)`;
