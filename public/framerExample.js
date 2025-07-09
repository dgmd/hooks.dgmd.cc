// Get Started: https://www.framer.com/developers

import {
    DATE_PRETTY_SHORT_DATE,
    DATE_PRETTY_SHORT_NUMERIC_DATE,
    formatDateForNotion,
    getDbIdByName,
    getNotionDataDb,
    getNotionDataPage,
    getNotionDataPageId,
    getNotionDataPageMetadata,
    getNotionDataPageProperties,
    getNotionDataPagePropertyValue,
    getNotionDataPages,
    getNotionDataPrimaryDbId,
    getNotionDataRelationDbIds,
    hasNotionDataNextCursor,
    isNotionDataLive,
    isNotionDataLoaded,
    isNotionDataValid,
    prettyPrintNotionDate,
    useNotionData,
} from ""
import { useEffect, useState } from "react"

const UISTATE_LOADING = "UISTATE_LOADING"
const UISTATE_ERROR = "UISTATE_ERROR"
const UISTATE_HOME = "UISTATE_HOME"

/**
 * @framerSupportedLayoutWidth auto
 * @framerSupportedLayoutHeight auto
 */
export default function ProgressUpdater(props) {
    const {
        handleCreate,
        handleUpdate,
        handleDelete,
        handleNextCursor,
        cancelRequest,
        notionData,
        updating,
        progress,
        error,
        result,
        operationType,
        operationId,
    } = useNotionData(
    )
    const loaded = isNotionDataLoaded(notionData)
    const valid = isNotionDataValid(notionData)

    const [UIState, setUIState] = useState(UISTATE_LOADING)

    const [newDate, setNewDate] = useState(() => {
        return new Date().toISOString().split("T")[0]
    })
    const [newTitle, setNewTitle] = useState("new title")
    const [newAttachments, setNewAttachments] = useState(null)

    // Track edit state and values for each entry
    const [editStates, setEditStates] = useState({})
    const [editValues, setEditValues] = useState({})

    useEffect(() => {
        if (!loaded) {
            setUIState(UISTATE_LOADING)
        }
        if (!valid) {
            setUIState(UISTATE_ERROR)
        }
        setUIState(UISTATE_HOME)
    }, [loaded, valid])

    useEffect(() => {
        console.log( 'result of last operation', result );
    }, [
        result
    ] );

    const primaryDbId = getNotionDataPrimaryDbId(notionData)

    const handleFileChange = (event) => {
        if (event.target.files.length) {
            setNewAttachments(
                Array.from(event.target.files).map((file, idx) => ({
                    file,
                    uid: `file_${idx}`,
                    name: file.name,
                }))
            )
        }
    }

    const handleAddClick = async () => {
        const { isoUTC, isoLocal } = formatDateForNotion(newDate)
        const properties = {
            date: {
                TYPE: "date",
                VALUE: isoLocal,
            },
            name: { TYPE: "title", VALUE: newTitle },
        }
        if (newAttachments) {
            properties.images = {
                TYPE: "file_upload",
                VALUE: newAttachments.map((a) => a.uid),
            }
        }
        const data = {
            DATABASE_ID: primaryDbId,
            PROPERTIES: properties,
        }
        const [num, creationPromise] = await handleCreate(data, newAttachments)
        const createdResult = await creationPromise
        console.log( 'result of last operation (inline)', createdResult );
    }

    // Handle edit field changes
    const handleEditChange = (id, field, value) => {
        setEditValues((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }))
    }

    // Handle edit image file change
    const handleEditFileChange = (id, event) => {
        if (event.target.files.length) {
            setEditValues((prev) => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    images: Array.from(event.target.files).map((file, idx) => ({
                        file,
                        uid: `editfile_${id}_${idx}`,
                        name: file.name,
                    })),
                },
            }))
        }
    }

    // Start editing an entry
    const startEdit = (pg) => {
        const id = getNotionDataPageId(pg)
        const dateValue = getNotionDataPagePropertyValue(pg, "date")
        const titleValue = getNotionDataPagePropertyValue(pg, "name")
        setEditStates((prev) => ({ ...prev, [id]: true }))
        setEditValues((prev) => ({
            ...prev,
            [id]: {
                name: titleValue,
                date: dateValue["START_DATE"]?.split("T")[0] || "",
                images: null,
            },
        }))
    }

    // Cancel editing
    const cancelEdit = (id) => {
        setEditStates((prev) => ({ ...prev, [id]: false }))
        setEditValues((prev) => {
            const { [id]: omit, ...rest } = prev
            return rest
        })
    }

    // Handle update
    const handleUpdateClick = (pg) => {
        const pgId = getNotionDataPageId(pg)
        const values = editValues[pgId]
        if (!values) return
        const { isoUTC, isoLocal } = formatDateForNotion(values.date)
        const properties = {
            date: {
                TYPE: "date",
                VALUE: isoLocal,
            },
            name: { TYPE: "title", VALUE: values.name },
        }
        if (values.images) {
            properties.images = {
                TYPE: "file_upload",
                VALUE: values.images.map((a) => a.uid),
            }
        }
        const data = {
            DATABASE_ID: primaryDbId,
            PAGE_ID: pgId,
            PROPERTIES: properties,
        }
        handleUpdate(data, values.images)
        cancelEdit(pgId)
    }

    // Handle delete
    const handleDeleteClick = (pg) => {
        const pgId = getNotionDataPageId(pg)
        handleDelete(primaryDbId, pgId)
    }

    const getHomeComponent = () => {
        return (
            <div>
                <div
                    style={{
                        border: "solid black",
                        padding: "10px",
                        opacity: `${updating ? 0.5 : 1}`,
                    }}
                >
                    new entry:
                    <br />
                    <input
                        type="date"
                        value={newDate}
                        onChange={(event) => {
                            return setNewDate(event.target.value)
                        }}
                        disabled={updating}
                    />
                    <br />
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(event) => setNewTitle(event.target.value)}
                        disabled={updating}
                    />
                    <br />
                    <input
                        type="file"
                        onChange={handleFileChange}
                        disabled={updating}
                    />
                    <br />
                    <button onClick={handleAddClick} disabled={updating}>
                        add entry
                    </button>
                </div>

                <div>
                    {getNotionDataPages(notionData, primaryDbId)
                        .sort((a, b) => {
                            const dateValueA = getNotionDataPagePropertyValue(
                                a,
                                "date"
                            )
                            const dateValueB = getNotionDataPagePropertyValue(
                                b,
                                "date"
                            )
                            const dateValueAStr = dateValueA["START_DATE"]
                            const dateValueBStr = dateValueB["START_DATE"]
                            const dateValueATZ = dateValueA["TIME_ZONE"]
                            const dateValueBTZ = dateValueB["TIME_ZONE"]
                            const dateA = dateValueATZ
                                ? new Date(dateValueAStr).toLocaleString(
                                      "en-US",
                                      { dateValueATZ }
                                  )
                                : new Date(dateValueAStr)
                            const dateB = dateValueBTZ
                                ? new Date(dateValueBStr).toLocaleString(
                                      "en-US",
                                      { dateValueBTZ }
                                  )
                                : new Date(dateValueBStr)
                            return dateA.getTime() - dateB.getTime()
                        })
                        .map((pg, idx) => {
                            const id = getNotionDataPageId(pg)
                            const dateValue = getNotionDataPagePropertyValue(
                                pg,
                                "date"
                            )
                            const titleValue = getNotionDataPagePropertyValue(
                                pg,
                                "name"
                            )
                            const imagesValue = getNotionDataPagePropertyValue(
                                pg,
                                "images"
                            )
                            const isEditing = !!editStates[id]
                            const editVal = editValues[id] || {}

                            return (
                                <div
                                    style={{
                                        border: "dashed 1px",
                                        marginBottom: "10px",
                                        padding: "8px",
                                    }}
                                    key={id}
                                >
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="date"
                                                value={editVal.date || ""}
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        id,
                                                        "date",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={updating}
                                            />
                                            <br />
                                            <input
                                                type="text"
                                                value={editVal.name || ""}
                                                onChange={(e) =>
                                                    handleEditChange(
                                                        id,
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={updating}
                                            />
                                            <br />
                                            <input
                                                type="file"
                                                multiple
                                                onChange={(e) =>
                                                    handleEditFileChange(id, e)
                                                }
                                                disabled={updating}
                                            />
                                            <br />
                                            {imagesValue &&
                                                imagesValue.map((img, i) => (
                                                    <img
                                                        src={img}
                                                        width="100px"
                                                        height="100px"
                                                        key={i}
                                                        style={{
                                                            marginRight: 4,
                                                        }}
                                                    />
                                                ))}
                                            <br />
                                            <button
                                                onClick={() =>
                                                    handleUpdateClick(pg)
                                                }
                                                disabled={updating}
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => cancelEdit(id)}
                                                disabled={updating}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(pg)
                                                }
                                                disabled={updating}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {prettyPrintNotionDate(
                                                dateValue["START_DATE"]
                                            )}
                                            <br />
                                            title: {titleValue}
                                            <br />
                                            images:
                                            {imagesValue &&
                                                imagesValue.map((img, i) => (
                                                    <img
                                                        src={img}
                                                        width="100px"
                                                        height="100px"
                                                        key={i}
                                                        style={{
                                                            marginRight: 4,
                                                        }}
                                                    />
                                                ))}
                                            <br />
                                            <button
                                                onClick={() => startEdit(pg)}
                                                disabled={updating}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteClick(pg)
                                                }
                                                disabled={updating}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            )
                        })}
                </div>
            </div>
        )
    }

    return (
        <div>
            {(() => {
                switch (UIState) {
                    case UISTATE_LOADING: {
                        return <div style={{ color: "red" }}>loading</div>
                    }
                    case UISTATE_ERROR: {
                        return <div style={{ color: "red" }}>error</div>
                    }
                    case UISTATE_HOME: {
                        return getHomeComponent()
                    }
                }
            })()}
        </div>
    )
}
