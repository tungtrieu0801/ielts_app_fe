import { useEffect } from 'react';
import { useColorMode } from '../../components/ui/color-mode.jsx';
import { useAuthStore } from '../../stores/useAuthStore.js';

/**
 * ColorModeSyncer:
 * - Khi app khởi động, đọc preference đã lưu trong useAuthStore (persist localStorage)
 *   và áp dụng vào next-themes ngay lập tức.
 * - Khi user thay đổi mode (qua ColorModeButton), lưu lại vào store.
 * - Không render gì cả (null component).
 */
const ColorModeSyncer = () => {
    const { colorMode, setColorMode } = useColorMode();
    const { colorMode: savedMode, setColorModePreference } = useAuthStore();

    // Lần đầu load: áp dụng mode đã lưu
    useEffect(() => {
        if (savedMode && savedMode !== colorMode) {
            setColorMode(savedMode);
        }
    }, []); // eslint-disable-line

    // Mỗi khi colorMode thay đổi (user toggle): lưu vào store
    useEffect(() => {
        if (colorMode && colorMode !== savedMode) {
            setColorModePreference(colorMode);
        }
    }, [colorMode]); // eslint-disable-line

    return null;
};

export default ColorModeSyncer;
