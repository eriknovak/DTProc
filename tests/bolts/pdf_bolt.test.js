const path = require("path");
const assert = require("assert");
const { create } = require("../../dist/components/bolts/pdf_bolt");

describe("PdfBolt", function () {
    it("constructable", function () {
        const target = create();
    });
    it("init passes", async function () {
        const emited = [];
        const name = "some_name";
        const config = {
            onEmit: async (data, stream_id) => {
                emited.push({ data, stream_id });
            },
            document_location_path: "path",
            document_location_type: "remote",
            document_pdf_path: "pdf",
            document_error_path: "error"
        };
        const target = create();
        await target.init(name, config, null);
    });
    it("recieve - get pdf - local", async function () {
        this.timeout(3000);
        const emited = [];
        const name = "some_name";
        const xdata = {
            path: path.join(__dirname, "../../example/files/paper.pdf"),
            type: { ext: "pdf", mime: "application/pdf" }
        };
        const xstream_id = null;
        const config = {
            onEmit: async (data, stream_id) => {
                emited.push({ data, stream_id });
            },
            document_location_path: "path",
            document_location_type: "local",
            document_pdf_path: "pdf",
            document_error_path: "error"
        };
        const target = create();
        await target.init(name, config, null);
        await target.receive(xdata, xstream_id);

        assert.equal(emited.length, 1);
        assert.equal(emited[0].data.path, xdata.path);
        assert.deepEqual(emited[0].data.type, xdata.type);
        assert.notEqual(emited[0].data.pdf, null);
        assert.equal(emited[0].data.pdf.pages, 4);
        assert.equal(emited[0].stream_id, null);
    });

    it("recieve - get pdf - remote", async function () {
        this.timeout(3000);
        const emited = [];
        const name = "some_name";
        const xdata = {
            path: "http://ailab.ijs.si/dunja/SiKDD2018/Papers/NovakErik.pdf",
            type: null
        };
        const xstream_id = null;
        const config = {
            onEmit: async (data, stream_id) => {
                emited.push({ data, stream_id });
            },
            document_location_path: "path",
            document_location_type: "remote",
            document_pdf_path: "pdf",
            document_error_path: "error"
        };
        const target = create();
        await target.init(name, config, null);
        await target.receive(xdata, xstream_id);

        assert.equal(emited.length, 1);
        assert.equal(emited[0].data.path, xdata.path);
        assert.deepEqual(emited[0].data.type, xdata.type);
        assert.notEqual(emited[0].data.pdf, null);
        assert.equal(emited[0].data.pdf.pages, 4);
        assert.equal(emited[0].stream_id, null);
    });
    it("recieve - get material type - remote - error", async function () {
        this.timeout(3000);
        const emited = [];
        const name = "some_name";
        const xdata = {
            path: "http://example.com/awd",
            type: null
        };
        const xstream_id = null;
        const config = {
            onEmit: async (data, stream_id) => {
                emited.push({ data, stream_id });
            },
            document_location_path: "path",
            document_type_path: "type",
            document_error_path: "error"
        };
        const target = create();
        await target.init(name, config, null);
        await target.receive(xdata, xstream_id);

        assert.equal(emited.length, 1);
        assert.equal(emited[0].data.path, xdata.path);
        assert.deepEqual(emited[0].data.type, null);
        assert.notEqual(emited[0].data.error, null);
        assert.equal(emited[0].stream_id, "stream_error");
    });
});
