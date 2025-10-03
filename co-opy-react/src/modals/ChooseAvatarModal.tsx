type Props = {
  selectedAvatar: number | null
  setSelectedAvatar: (id: number) => void
}

function ChooseAvatarModal({ selectedAvatar, setSelectedAvatar }: Props) {
    return (
        <>
            <h2>CHOOSE YOUR AVATAR</h2>
            <div className='avatar-buttons'>
                {[1, 2, 3, 4, 5].map(i => (
                    <button key={i}
                            className={selectedAvatar === i ? 'selected' : ''}
                            onClick={() => setSelectedAvatar(i)}>
                    </button>
                ))}
            </div>
            
            <input type='text' />
        </>
    )
}

export default ChooseAvatarModal