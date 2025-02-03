"use client";

import { Button } from "@/components/ui/button";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Globe, Phone } from "lucide-react";
import { useEffect, useState } from "react";

export default function KanbanBoard() {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const response = await fetch("/api/stage/679f900d542dde87c6d8c41d");
      const data = await response.json();
      setColumns(data.stage.stages);
    } catch (error) {
      console.error("Error fetching stages:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const newColumns = Array.from(columns);
    const sourceColumn = newColumns.find((col) => col._id === source.droppableId);
    const destColumn = newColumns.find((col) => col._id === destination.droppableId);

    const [movedLead] = sourceColumn.leads.splice(source.index, 1);
    destColumn.leads.splice(destination.index, 0, movedLead);

    setColumns(newColumns);

    // Update the database
    try {
      await fetch("/api/stage/679f900d542dde87c6d8c41d", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceColumnId: source.droppableId,
          destinationColumnId: destination.droppableId,
          leadId: movedLead._id,
          newIndex: destination.index,
        }),
      });
    } catch (error) {
      console.error("Error updating lead position:", error);
    }
  };

  const handleCall = (phone) => {
    console.log(`Calling ${phone}`);
    // Implement actual call functionality here
  };

  const handleVisitWebsite = (website) => {
    window.open(website, "_blank");
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lead Management Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {columns.map((column) => (
            <div key={column._id} className="bg-gray-100 p-4 rounded-lg flex-1">
              <h2 className="text-lg font-semibold mb-2">{column.title}</h2>
              <Droppable droppableId={column._id}>
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 min-h-[200px]">
                    {column.leads.map((lead, index) => (
                      <Draggable key={lead._id} draggableId={lead._id} index={index}>
                        {(provided) => (
                          <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-white p-3 rounded shadow">
                            <div className="flex flex-col">
                              <p className="bg-red-600 p-5 text-white">{lead._id}</p>
                              <p className="font-semibold">{lead.Title}</p>

                              <p className="text-sm text-gray-600">{lead.Email}</p>
                              <p className="text-sm text-gray-600">{lead.Category}</p>
                              {lead.Rating && (
                                <p className="text-sm text-gray-600">
                                  Rating: {lead.Rating} ({lead["Rating Info"]})
                                </p>
                              )}
                              <div className="flex mt-2">
                                <Button size="sm" onClick={() => handleCall(lead.Phone)} className="mr-2">
                                  <Phone className="h-4 w-4 mr-1" />
                                  Call
                                </Button>
                                <Button size="sm" onClick={() => handleVisitWebsite(lead.Website)}>
                                  <Globe className="h-4 w-4 mr-1" />
                                  Visit
                                </Button>
                              </div>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
