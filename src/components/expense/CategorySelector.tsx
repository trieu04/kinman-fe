import * as React from "react";
import { Tag } from "lucide-react";
import { Button } from "../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import categoryService from "../../services/categoryService";
import type { Category } from "../../types";

interface CategorySelectorProps {
    categories: Category[];
    selectedCategoryId: string;
    onCategorySelect: (categoryId: string) => void;
    onCategoryCreated: (category: Category) => void;
}

const DEFAULT_CATEGORIES = [
    { name: "Food & Dining", icon: "🍔" },
    { name: "Transportation", icon: "🚗" },
    { name: "Shopping", icon: "🛍️" },
    { name: "Entertainment", icon: "🎬" },
    { name: "Bills & Utilities", icon: "💡" },
];

export function CategorySelector({
    categories,
    selectedCategoryId,
    onCategorySelect,
    onCategoryCreated,
}: CategorySelectorProps) {
    const [showNewCategory, setShowNewCategory] = React.useState(false);
    const [newCategoryName, setNewCategoryName] = React.useState("");
    const [isCreating, setIsCreating] = React.useState(false);

    const handleCreateDefaultCategory = async (name: string) => {
        setIsCreating(true);
        try {
            const category = await categoryService.create({ name });
            onCategoryCreated(category);
            onCategorySelect(category.id);
        } catch (error) {
            console.error("Failed to create default category:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateCategory = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newCategoryName.trim()) return;

        setIsCreating(true);
        try {
            const category = await categoryService.create({ name: newCategoryName.trim() });
            onCategoryCreated(category);
            onCategorySelect(category.id);
            setShowNewCategory(false);
            setNewCategoryName("");
        } catch (error) {
            console.error("Failed to create category:", error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Category
            </label>
            <div className="h-10">
                {showNewCategory ? (
                    <div className="flex gap-2 h-full">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleCreateCategory(e);
                                }
                            }}
                            placeholder="Category name"
                            className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            autoFocus
                            disabled={isCreating}
                        />
                        <Button
                            size="sm"
                            onClick={handleCreateCategory}
                            className="h-10 px-3"
                            disabled={isCreating}
                        >
                            Add
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowNewCategory(false)}
                            className="h-10 w-10 p-0"
                            disabled={isCreating}
                        >
                            ×
                        </Button>
                    </div>
                ) : (
                    <Select value={selectedCategoryId} onValueChange={onCategorySelect}>
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.length === 0 && (
                                <div className="p-2">
                                    <p className="text-xs text-muted-foreground mb-2 px-2">
                                        Suggestions:
                                    </p>
                                    {DEFAULT_CATEGORIES.map((defCat) => (
                                        <button
                                            key={defCat.name}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
                                            onClick={() => handleCreateDefaultCategory(defCat.name)}
                                            disabled={isCreating}
                                        >
                                            <span>{defCat.icon}</span>
                                            <span>{defCat.name}</span>
                                        </button>
                                    ))}
                                    <div className="h-px bg-border my-2" />
                                </div>
                            )}
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </SelectItem>
                            ))}
                            <div
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowNewCategory(true);
                                }}
                                className="w-full px-2 py-1.5 text-sm text-left text-primary hover:bg-accent cursor-pointer flex items-center gap-2"
                            >
                                <span className="text-lg leading-none">+</span> Create new
                                category
                            </div>
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}
