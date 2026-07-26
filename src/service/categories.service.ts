import api from "./libs/axios";



  export const getCategories = async (search?: string) => {
  return await api.get(`/api/v1/categories`, { params: { search } });
};
export const getCategoriesList = async ()  => {
  return await api.get("/api/v1/categories/list")
};


export const createCategory = async (request: any) => {
 return await api.post("/api/v1/categories", request)  };


export const updateCategory = async (id: number, request: any) => {
  const res = await fetch(`http://localhost:3000/api/v1/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  const data = await res.json();
  return data;
};
export const deleteCategory = async (id?: number, ) => {
return await api.delete(`/api/v1/categories/${id}`)
};