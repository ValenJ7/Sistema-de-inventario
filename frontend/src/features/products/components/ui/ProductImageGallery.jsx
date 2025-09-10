import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Star, GripVertical } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

function SortableImage({ img, onDelete, onSetMain }) {
  // IMPORTANT: usamos useSortable, pero NO ponemos listeners en el contenedor,
  // sino en un "drag handle" para que los botones sean clickeables.
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded overflow-hidden border group ${
        img.sort_order === 0 ? "border-blue-500" : "border-gray-200"
      }`}
    >
      {/* Imagen */}
      <img
        src={`http://localhost/SistemaDeInventario/backend${img.url}`}
        alt="producto"
        className="w-full h-24 object-cover select-none"
        draggable={false}
      />

      {/* Badge principal */}
      {img.sort_order === 0 && (
        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow">
          Principal
        </span>
      )}

      {/* Overlay: no bloquea eventos; los botones sí los reciben */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition flex items-start justify-between p-2 pointer-events-none">
        {/* ⭐ Solo si NO es principal */}
        {img.sort_order !== 0 && (
          <button
            onClick={() => onSetMain(img.id)}
            className="pointer-events-auto h-8 w-8 flex items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-yellow-500 hover:text-white shadow-md transform scale-95 hover:scale-100 transition"
            title="Marcar como principal"
            type="button"
          >
            <Star className="h-4 w-4" />
          </button>
        )}

        {/* Botón eliminar */}
        <button
          onClick={onDelete}
          className="pointer-events-auto h-8 w-8 flex items-center justify-center rounded-full bg-white/90 text-gray-700 hover:bg-red-600 hover:text-white shadow-md transform scale-95 hover:scale-100 transition ml-auto"
          title="Eliminar imagen"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Drag handle (abajo a la derecha) */}
      <button
        {...attributes}
        {...listeners}
        className="absolute bottom-1 right-1 h-7 w-7 rounded-md bg-white/90 shadow flex items-center justify-center cursor-move pointer-events-auto"
        title="Arrastrar para reordenar"
        type="button"
      >
        <GripVertical className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ProductImageGallery({ images, onDeleteImage, onSetMain, onReorder }) {
  const [items, setItems] = useState(images);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    setItems(images);
  }, [images]);

  const handleConfirmDelete = () => {
    if (confirmId) {
      onDeleteImage(confirmId);
      setConfirmId(null);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);

    const orders = newItems.map((img, idx) => ({
      id: img.id,
      sort_order: idx, // 0 será la primera (principal si luego no la cambiás)
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
                onDelete={() => setConfirmId(img.id)} // abre modal
                onSetMain={onSetMain}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Modal de confirmación */}
      <ConfirmDialog
        open={!!confirmId}
        title="Eliminar imagen"
        message="¿Seguro que querés eliminar esta imagen? Esta acción no se puede deshacer."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
