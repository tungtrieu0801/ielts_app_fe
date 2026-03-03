import { motion } from "framer-motion";

const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }} // Nhích nhẹ từ dưới lên
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }} // Biến mất hướng lên trên
        transition={{
            duration: 0.4,
            ease: [0.25, 1, 0.5, 1] // Custom cubic-bezier cho cảm giác "premium"
        }}
    >
        {children}
    </motion.div>
);

export default PageTransition;