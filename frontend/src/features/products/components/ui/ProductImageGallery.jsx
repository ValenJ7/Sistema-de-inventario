import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Star } from "lucide-react";

function SortableImage({ img, onDelete, onSetMain }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative rounded overflow-hidden border group ${
        img.sort_order === 0 ? "border-blue-500" : "border-gray-200"
      }`}
    >
      {/* Imagen */}
      <img
        src={`http://localhost/SistemaDeInventario/backend${img.url}`}
        alt="producto"
        className="w-full h-24 object-cover"
      />

      {/* Badge principal */}
      {img.sort_order === 0 && (
        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow">
          Principal
        </span>
      )}

      {/* Overlay con botones */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition flex items-start justify-between p-2">
        {/* ⭐ Solo si NO es principal */}
        {img.sort_order !== 0 && (
          <button
            onClick={() => onSetMain(img.id)}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-yellow-500 hover:text-white shadow-md transform scale-95 hover:scale-100 transition"
            title="Marcar como principal"
          >
            <Star className="h-4 w-4" />
          </button>
        )}
        {/* 🗑 Eliminar */}
        <button
          onClick={() => onDelete(img.id)}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-red-600 hover:text-white shadow-md transform scale-95 hover:scale-100 transition ml-auto"
          title="Eliminar imagen"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function ProductImageGallery({ images, onDelete, onSetMain, onReorder }) {
  const [items, setItems] = useState(images);

  // Sincronizar cuando cambian las imágenes externas
  useEffect(() => {
    setItems(images);
  }, [images]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    // Recalcular sort_order
    const orders = newItems.map((img, idx) => ({
      id: img.id,
      sort_order: idx,
    }));

    setItems(newItems);
    onReorder(orders);
  };

  if (!items?.length) {
    return <p className="text-sm text-gray-500">Este producto no tiene imágenes cargadas.</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Galería de imágenes (arrastrá para reordenar)</h3>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-3 gap-3">
            {items.map((img) => (
              <SortableImage
                key={img.id}
                img={img}
                onDelete={onDelete}
                onSetMain={onSetMain}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
