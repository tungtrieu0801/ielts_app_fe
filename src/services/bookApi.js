import axiosClient from "../config/axios.js";

export const uploadBook = async (formData) => {
    const response = await axiosClient.post("/books/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getBooks = async () => {
    const response = await axiosClient.get("/books");
    return response.data;
};

export const getBookDetails = async (id) => {
    const response = await axiosClient.get(`/books/${id}`);
    return response.data;
};

export const updateBookProgress = async (id, currentPage) => {
    const response = await axiosClient.post(`/books/${id}/progress`, { currentPage });
    return response.data;
};
