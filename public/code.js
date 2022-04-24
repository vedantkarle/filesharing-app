(function () {
	let receiverId;

	const socket = io();

	const generateId = () => {
		return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
			Math.random() * 999,
		)}-${Math.trunc(Math.random() * 999)}`;
	};

	document
		.querySelector("#sender-start-con-btn")
		.addEventListener("click", function () {
			let joinID = generateId();

			document.querySelector(
				"#join-id",
			).innerHTML = `<b>Room ID</b><br/><span>${joinID}</span><br/><span>Send this ID to the receiver</span>`;

			socket.emit("sender-join", {
				uid: joinID,
			});
		});

	socket.on("init", uid => {
		receiverId = uid;
		document.querySelector(".join-screen").classList.remove("active");
		document.querySelector(".fs-screen").classList.add("active");
	});

	document.querySelector("#file-input").addEventListener("change", e => {
		let file = e.target.files[0];
		if (!file) {
			return;
		}
		let reader = new FileReader();
		reader.onload = function (e) {
			let buffer = new Uint8Array(reader.result);
			let el = document.createElement("div");
			el.classList.add("item");
			el.innerHTML = `
			<div class="column">
                            <div class="card">
                                <div class="card-content">
                                    <div class="content">
                                        <div class="progress-percent">0%</div>
                                        <hr />
                                        <div class="filename">${file.name}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
			`;
			document.querySelector(".columns").appendChild(el);
			shareFile(
				{
					filename: file.name,
					total_buffer_size: buffer.length,
					buffer_size: 4096,
				},
				buffer,
				el.querySelector(".progress-percent"),
			);
		};
		reader.readAsArrayBuffer(file);
	});

	const shareFile = (metadata, buffer, progress) => {
		socket.emit("file-meta", {
			uid: receiverId,
			metadata,
		});
		socket.on("fs-share", () => {
			let chunk = buffer.slice(0, metadata.buffer_size);
			buffer = buffer.slice(metadata.buffer_size, buffer.length);
			progress.innerText =
				Math.trunc(
					((metadata.total_buffer_size - buffer.length) /
						metadata.total_buffer_size) *
						100,
				) + "%";
			if (chunk.length !== 0) {
				socket.emit("file-raw", {
					uid: receiverId,
					buffer: chunk,
				});
			}
		});
	};
})();
