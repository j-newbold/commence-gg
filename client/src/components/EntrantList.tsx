import { forwardRef, useContext, useState } from "react";
import { TourneyContext } from "./routes/Tournament";
import { SingleBracket } from "../utils/types";
import Button from "react-bootstrap/Button";
import './Components.css';

import {
  closestCenter,
  DndContext, 
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Entrant } from "../utils/types";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

export default function EntrantList(props: any) {
    const tourneyState: {
        tourneyData: SingleBracket,
        setTourneyData: any
    } = useContext(TourneyContext);

    const [activeId, setActiveId] = useState(null);

    const [editSeeding, setEditSeeding] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSubmitSeeding = async () => {
        try {
            const response = await fetch(import.meta.env.VITE_API_URL+`tournaments/${tourneyState.tourneyData.tournamentId}/saveSeeding`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'content-type': 'application/json'
                }, body: JSON.stringify({
                    players: tourneyState.tourneyData.playerList.map((e: any, i: number) => {
                        return {
                            id: (i+1),
                            uuid: e.uuid
                        }
                    })
                })
            })
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            <DndContext
                onDragEnd={handleDragEnd}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
            >
                <SortableContext
                    items={tourneyState.tourneyData.playerList}
                    strategy={verticalListSortingStrategy}
                >

                    {tourneyState.tourneyData.playerList.map((e: Entrant, i: number) => {
                        return (
                            <EntrantListItem
                                key={e.id}
                                id={e.id}
                                entrant={e}
                                listNum={i}
                                editSeeding={editSeeding}
                            />
                        );
                    })}
                </SortableContext>
                <DragOverlay>
                    {activeId ? <Item id={activeId} entrant={tourneyState.tourneyData.playerList.find(e => e.id === activeId)} /> : null}
                </DragOverlay>
            </DndContext>
            
            <div>
                {editSeeding?
                    <div>
                        <Button variant='secondary' onClick={() => setEditSeeding(false)}>Cancel</Button>
                        <Button variant='primary' onClick={handleSubmitSeeding}>Save Seeding</Button>
                    </div>
                    :
                    <div><Button onClick={() => setEditSeeding(true)} >Edit Seeding</Button></div>
                }
            </div>

        </div>
    );

    function handleDragStart(event: any) {
        const {active} = event;
        
        setActiveId(active.id);
    }
        
    function handleDragEnd(event: any) {
        const {active, over} = event;
        
        if (active.id !== over.id) {
            
            tourneyState.setTourneyData((prev: SingleBracket) => {
                const oldIndex = tourneyState.tourneyData.playerList.findIndex(en => en.id === active.id);
                const newIndex = tourneyState.tourneyData.playerList.findIndex(en => en.id === over.id);
                
                return {
                    ...prev,
                    playerList: arrayMove(prev.playerList,oldIndex,newIndex)
                }
            });
            }
        
        setActiveId(null);
    }
}

function EntrantListItem(props: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({id: props.id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }
    return (
        <div className='entrant-list'>
            <div>
                {props.listNum+1}{'. '}
            </div>
            {props.editSeeding?
                <Item 
                    entrant={props.entrant}
                    id={props.id}
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners} />
                :
                <FixedItem
                    entrant={props.entrant}
                    id={props.id} />

            }
        </div>
    );
}

const Item = forwardRef(({id, entrant, ...props}: any, ref) => {
    return (
        <div {...props} ref={ref} className="drag-item">
            {entrant?.tag}
            <button className="drag-handle">
                <svg viewBox="0 0 20 20" width="12">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 ,2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                </svg>
            </button>
        </div>
    )
});

function FixedItem({id, entrant, ...props}: any) {
    return (
        <div className="drag-item">
            {entrant?.tag}
        </div>
    )
}