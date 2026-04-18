"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Edit2, Trash2, Loader2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface BlogActionsProps {
    slug: string;
    variant?: "icon" | "full";
    onDelete?: () => void;
}

export default function BlogActions({ slug, variant = "full", onDelete }: BlogActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/blog/${slug}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete post.");
            }

            toast.success("Blog post deleted successfully.");
            setShowDeleteAlert(false);

            if (onDelete) {
                onDelete();
            } else {
                router.push("/blog");
                router.refresh();
            }
        } catch (error) {
            toast.error("An error occurred while deleting.");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (variant === "icon") {
        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/blog/${slug}/edit`} className="flex items-center cursor-pointer">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Post
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive cursor-pointer"
                            onSelect={() => setShowDeleteAlert(true)}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Post
                        </DropdownMenuItem>
                        <div className="h-px bg-border my-1" />
                        <DropdownMenuItem
                            className="text-muted-foreground focus:text-foreground cursor-pointer"
                            onSelect={async () => {
                                await fetch("/api/auth/logout", { method: "POST" });
                                router.push("/blog");
                                router.refresh();
                            }}
                        >
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Alert deleteAction={handleDelete} isDeleting={isDeleting} open={showDeleteAlert} onOpenChange={setShowDeleteAlert} />
            </>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href={`/blog/${slug}/edit`}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                </Link>
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteAlert(true)}
                disabled={isDeleting}
            >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground border-transparent hover:border-border"
                onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/blog");
                    router.refresh();
                }}
            >
                Log Out
            </Button>
            <Alert deleteAction={handleDelete} isDeleting={isDeleting} open={showDeleteAlert} onOpenChange={setShowDeleteAlert} />
        </div>
    );
}

function Alert({
    open,
    onOpenChange,
    isDeleting,
    deleteAction,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isDeleting: boolean;
    deleteAction: () => void;
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the blog post.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            deleteAction();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Delete Post
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
