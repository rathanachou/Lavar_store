import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import type { ICategory } from "../../types/category";
 interface Props {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void;
    category?:  ICategory
    confirmDelete: () => void;
 }

const ConfirmDelete = ({isOpen,setIsOpen, category, confirmDelete}: Props) => {

  return (
    <AlertDialog  open={isOpen}  onOpenChange  ={setIsOpen}>
  <AlertDialogTrigger asChild >
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you  want  delete sure?{category?.name}</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. 
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
  )
}

export default ConfirmDelete