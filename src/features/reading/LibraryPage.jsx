import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Button, SimpleGrid, Image, Input } from "@chakra-ui/react";
import { FiUpload, FiBookOpen } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../layouts/BaseLayout.jsx";
import { getBooks, uploadBook } from "../../services/bookApi.js";

const LibraryPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const data = await getBooks();
            setBooks(data);
        } catch (error) {
            console.error("Lỗi khi tải sách", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("pdf", file);
            formData.append("title", file.name.replace(".pdf", ""));
            
            await uploadBook(formData);
            await fetchBooks();
        } catch (error) {
            console.error("Lỗi upload", error);
            alert("Upload thất bại, vui lòng thử lại!");
        } finally {
            setUploading(false);
        }
    };

    return (
        <BaseLayout>
            <Box maxW="1200px" mx="auto">
                <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                        <Text fontSize="3xl" fontWeight="900" mb={2}>
                            Thư viện sách 📚
                        </Text>
                        <Text color="fg.muted">
                            Đọc sách tiếng Anh và lưu từ vựng trực tiếp khi đọc.
                        </Text>
                    </Box>
                    <Box position="relative">
                        <Input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleUpload} 
                            position="absolute" 
                            inset={0} 
                            opacity={0} 
                            cursor="pointer"
                            zIndex={1}
                            disabled={uploading}
                        />
                        <Button colorPalette="blue" size="md" gap={2} loading={uploading}>
                            <FiUpload /> Tải sách PDF lên
                        </Button>
                    </Box>
                </Flex>

                {loading ? (
                    <Text>Đang tải danh sách sách...</Text>
                ) : books.length === 0 ? (
                    <Box textAlign="center" py={12} bg="bg.panel" borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                        <Text color="fg.muted" mb={4}>Thư viện của bạn đang trống.</Text>
                        <Text>Hãy tải lên một cuốn sách PDF để bắt đầu học nhé!</Text>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
                        {books.map((book) => (
                            <Box 
                                key={book._id} 
                                bg="bg.panel" 
                                borderRadius="2xl" 
                                borderWidth="1px" 
                                borderColor="border.muted"
                                overflow="hidden"
                                transition="all 0.2s"
                                _hover={{ shadow: "md", transform: "translateY(-4px)" }}
                                cursor="pointer"
                                onClick={() => navigate(`/read/${book._id}`)}
                            >
                                <Box h="200px" bg="gray.100" _dark={{ bg: "gray.800" }} display="flex" alignItems="center" justifyContent="center">
                                    {book.coverUrl ? (
                                        <Image src={`http://localhost:5000${book.coverUrl}`} alt={book.title} objectFit="cover" w="full" h="full" />
                                    ) : (
                                        <FiBookOpen size={48} color="var(--chakra-colors-gray-400)" />
                                    )}
                                </Box>
                                <Box p={4}>
                                    <Text fontWeight="bold" fontSize="lg" noOfLines={2} mb={1}>
                                        {book.title}
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted">
                                        Thêm ngày: {new Date(book.createdAt).toLocaleDateString("vi-VN")}
                                    </Text>
                                </Box>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </Box>
        </BaseLayout>
    );
};

export default LibraryPage;
