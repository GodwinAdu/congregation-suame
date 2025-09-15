"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { X, ChevronDown, Search, Check, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  placeholder?: string;
  data: { _id: string; name: string }[];
  value: string[];
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  disabled?: boolean;
  maxItems?: number;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  emptyMessage?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  placeholder = "Select items...",
  data = [],
  value = [],
  onChange,
  onRemove,
  disabled = false,
  maxItems,
  searchable = true,
  clearable = true,
  className,
  emptyMessage = "No items found",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => {
    if (!value?.length || !data?.length) return [];
    return value
      .map((id) => data.find((item) => item._id === id))
      .filter((item): item is { _id: string; name: string } => !!item);
  }, [value, data]);

  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    
    let filtered = data.filter((item) => 
      !selected.some(selectedItem => selectedItem._id === item._id)
    );

    if (searchable && inputValue.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(inputValue.toLowerCase())
      );
    }

    return filtered;
  }, [data, selected, inputValue, searchable]);

  const isMaxReached = maxItems ? selected.length >= maxItems : false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredData.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredData[focusedIndex]) {
          handleSelect(filteredData[focusedIndex]._id);
        }
        break;
      case "Escape":
        setOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
      case "Backspace":
        if (!inputValue && selected.length > 0) {
          onRemove(selected[selected.length - 1]._id);
        }
        break;
    }
  };

  const handleSelect = (itemId: string) => {
    if (isMaxReached) return;
    onChange(itemId);
    setInputValue("");
    setFocusedIndex(-1);
    if (searchable) {
      inputRef.current?.focus();
    }
  };

  const handleRemove = (itemId: string) => {
    onRemove(itemId);
    if (searchable) {
      inputRef.current?.focus();
    }
  };

  const clearAll = () => {
    selected.forEach(item => onRemove(item._id));
    setInputValue("");
    if (searchable) {
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Main Input Container */}
      <div
        className={cn(
          "min-h-[2.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          open && "ring-2 ring-ring ring-offset-2"
        )}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <div className="flex flex-wrap gap-1 items-center">
          {/* Selected Items */}
          {selected.map((item, index) => (
            <Badge
              key={item._id}
              variant="secondary"
              className="h-6 px-2 py-0 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <span className="max-w-[100px] truncate">{item.name}</span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20 hover:text-destructive rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item._id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}

          {/* Input Field */}
          <div className="flex-1 flex items-center min-w-[120px]">
            {searchable ? (
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setOpen(true)}
                placeholder={selected.length === 0 ? placeholder : ""}
                disabled={disabled || isMaxReached}
                className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              />
            ) : (
              <span className={cn(
                "text-sm",
                selected.length === 0 ? "text-muted-foreground" : "sr-only"
              )}>
                {selected.length === 0 ? placeholder : ""}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {clearable && selected.length > 0 && !disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            <Separator orientation="vertical" className="h-4" />
            
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )} 
            />
          </div>
        </div>

        {/* Max Items Indicator */}
        {maxItems && (
          <div className="text-xs text-muted-foreground mt-1">
            {selected.length}/{maxItems} selected
            {isMaxReached && (
              <span className="text-amber-600 ml-2">Maximum reached</span>
            )}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95">
          {/* Search Header */}
          {searchable && (
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-8 h-8"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <ScrollArea className="max-h-60 overflow-auto">
            {filteredData.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {emptyMessage}
              </div>
            ) : (
              <div className="p-1">
                {filteredData.map((item, index) => (
                  <div
                    key={item._id}
                    className={cn(
                      "relative flex items-center gap-2 rounded-sm px-2 py-2 text-sm cursor-pointer transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      focusedIndex === index && "bg-accent text-accent-foreground",
                      isMaxReached && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isMaxReached && handleSelect(item._id)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <div className="flex-1 truncate">{item.name}</div>
                    {!isMaxReached && (
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="border-t p-2 bg-muted/50">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{selected.length} item{selected.length !== 1 ? 's' : ''} selected</span>
                {clearable && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs hover:text-destructive"
                    onClick={clearAll}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;