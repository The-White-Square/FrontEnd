type Props = {
  roomCreated: boolean
  setRoomCreated: (v: boolean) => void
}

function CreateRoomModal({ roomCreated, setRoomCreated }: Props) {
    return (
        <>
            <h2>CREATE ROOM</h2>
            {roomCreated && <h4 id='code'>123abc</h4>}
            <br /><br />
            <button onClick={() => setRoomCreated(true)}>Create</button>
        </>
    )
}

export default CreateRoomModal
