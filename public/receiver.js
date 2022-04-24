(function () {
	let senderId;

	const socket = io();

	const generateId = () => {
		return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
			Math.random() * 999,
		)}-${Math.trunc(Math.random() * 999)}`;
	};

	document
		.querySelector("#receiver-start-con-btn")
		.addEventListener("click", function () {
			senderId = document.querySelector("#join-id").value;
			if (senderId.length === 0) {
				return;
			}
			let joinID = generateId();

			socket.emit("receiver-join", {
				uid: joinID,
				sender_uid: senderId,
			});
			document.querySelector(".join-screen").classList.remove("active");
			document.querySelector(".fs-screen").classList.add("active");
		});

	let fileShare = {};

	socket.on("fs-meta", metadata => {
		fileShare.metadata = metadata;
		fileShare.transmitted = 0;
		fileShare.buffer = [];

		let el = document.createElement("div");
		el.classList.add("item");
		el.innerHTML = `
			<div class="column">
                            <div class="card">
                                <div class="card-content">
                                    <div class="content">
                                        <div class="progress-percent">0%</div>
                                        <hr />
                                        <div class="filename">${metadata.filename}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
			`;
		document.querySelector(".columns").appendChild(el);

		fileShare.progress = el.querySelector(".progress-percent");

		socket.emit("fs-start", {
			uid: senderId,
		});
	});

	socket.on("fs-share", buffer => {
		fileShare.buffer.push(buffer);
		fileShare.transmitted += buffer.byteLength;
		fileShare.progress.innerText =
			Math.trunc(
				(fileShare.transmitted / fileShare.metadata.total_buffer_size) * 100,
			) + "%";
		if (fileShare.transmitted === fileShare.metadata.total_buffer_size) {
			download(new Blob(fileShare.buffer), fileShare.metadata.filename);
			fileShare = {};
		} else {
			socket.emit("fs-start", {
				uid: senderId,
			});
		}
	});
})();
