import React, { useState, useEffect } from "react";
import { Modal, Button, Input, message, Typography, Spin, Tooltip } from "antd";
import { EditOutlined, CloseOutlined, SaveOutlined } from "@ant-design/icons";

const { Text } = Typography;

const BulletinBoard = ({ open, onClose, isGuest, api }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (!open) {
      setEditMode(false);
      return;
    }
    fetchBoard();
  }, [open]);

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/board");
      if (res.data.success) {
        setContent(res.data.data.content || "");
        setUpdatedAt(res.data.data.updatedAt);
        setEditContent(res.data.data.content || "");
      }
    } catch (e) {
      message.error("获取公告失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/settings", { key: "bulletin", value: { content: editContent } });
      setContent(editContent);
      setUpdatedAt(Date.now());
      setEditMode(false);
      message.success("公告已更新");
    } catch (e) {
      message.error("保存公告失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => { setEditMode(false); onClose(); }}
      footer={null}
      width={560}
      centered
      destroyOnClose
      title={null}
      closeIcon={null}
    >
      <div style={{ padding: "4px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Text strong style={{ fontSize: 18 }}>公告板</Text>
          <div style={{ display: "flex", gap: 8 }}>
            {!isGuest && !editMode && (
              <Tooltip title="编辑公告">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => setEditMode(true)}
                  size="small"
                />
              </Tooltip>
            )}
            <Button
              type="text"
              shape="circle"
              icon={<CloseOutlined />}
              onClick={() => { setEditMode(false); onClose(); }}
              size="small"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : !editMode ? (
          <>
            <div style={{
              minHeight: 120,
              padding: 16,
              borderRadius: 8,
              background: "rgba(0,0,0,0.02)",
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              fontSize: 14,
              color: content ? undefined : "#999",
            }}>
              {content || "暂无公告"}
            </div>
            {updatedAt && (
              <div style={{ marginTop: 12, textAlign: "right", fontSize: 12, color: "#999" }}>
                最后更新于 {new Date(updatedAt).toLocaleString("zh-CN")}
              </div>
            )}
          </>
        ) : (
          <>
            <Input.TextArea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              autoSize={{ minRows: 5, maxRows: 15 }}
              placeholder="输入公告内容..."
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={() => { setEditMode(false); setEditContent(content); }}>取消</Button>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
                保存
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default BulletinBoard;
