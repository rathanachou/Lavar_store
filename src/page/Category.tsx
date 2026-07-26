


import { Button } from "../components/ui/button";
import { DataTable } from "../components/data-table";
import { CategoryForm,  } from "../components/categories/CategoryForm";
import { columns } from "../components/categories/columns";
import { useCategories, useDeleteCategory } from "../hooks/useCategories";
import { useState } from "react";
import type { ICategory } from "../types/category";
import { useDebounce } from 'use-debounce';
import { toast } from "sonner";

import { Input } from "../components/ui/input";
import ConfirmDelete from "../components/categories/ConfirmDelete";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../utils/TokenStorage";


const Category = () => {
 
 const Navigate = useNavigate()
  const {mutate: deleteCategoryMutate} =  useDeleteCategory ();

  const [isOpen, setIsOpen] = useState(false);
   const[isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("");
  const [value]=   useDebounce(searchInput,500)
   console.log("value", value)
   const { data,} = useCategories(value);

  const [category, setCategory] = useState<ICategory | undefined>(undefined);

  const handleEdit = (category: ICategory) => {
    console.log("category", category);
    setCategory(category);
    setIsOpen(true);
  };
  const onDelete = (category: ICategory) => {
    console.log("category", category);
    setCategory(category);
    setIsDeleteOpen(true);
   
  }
  const confirmDelete =  () => {
     console.log("category", category);
     setCategory(category);
     deleteCategoryMutate(
      {id: category?.id},
       {
      onSuccess:  () => {
      toast. success ("category delete   successfully");
       },
   },
   )
  }

  const handleClose = (open: boolean) => {
    setIsOpen(open);
    setCategory(undefined);
  };
   const accessToken = getAccessToken();
    if (!accessToken) {
      Navigate("/login");
    }

  return (
    <div>
        <div>

          <div className="flex gap-4 mb-6">
          <Input
            className="w-[200px]"
            placeholder="Search product..."
            value={searchInput}
            onChange={(e) =>  setSearchInput(e.target.value)}
           
          />
          <Button >Search</Button>
        </div>
        </div>
      <div className="flex gap-4 mb-4">
        <Button onClick={  () => setIsOpen(true)}>Create</Button>
      </div>
      <DataTable
        columns={columns({ onEdit: handleEdit , onDelete })}
        data={data?.data ?? []}
      />
     <CategoryForm open={isOpen} setOpen={handleClose} category={category} />
    <ConfirmDelete 
     isOpen= {isDeleteOpen}
     setIsOpen={setIsDeleteOpen}
     category={category}
     confirmDelete={confirmDelete}
     />  
    </div>
  );
  
};



export  default Category;