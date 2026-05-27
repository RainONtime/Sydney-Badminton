import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'

const GENDER_LABEL = { male: '男', female: '女', other: '其他' }
const STATUS_LABEL = {
  pending: '待确认',
  confirmed: '已确认',
  rejected: '已驳回',
  waitlisted: '候补中',
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-950 break-all leading-relaxed">{value ?? '—'}</span>
    </div>
  )
}

export default function RegistrationDetailsModal({ registration: reg, onClose }) {
  const [fullscreen, setFullscreen] = useState(false)

  if (!reg) return null

  return (
    <>
      {/* ── 全屏截图 overlay ────────────────────────────────────── */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}  // 点遮罩关闭（第二道防线）
        >
          {/* 关闭按钮：fixed 固定在视口右上角，永不被图片推走 */}
          <button
            onClick={() => setFullscreen(false)}
            className="fixed top-4 right-4 z-[61] w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            aria-label="关闭截图"
          >
            <X size={15} />
          </button>

          {/* 可纵向滚动的图片容器，长图在此内部滚动 */}
          <div
            className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={reg.payment_screenshot}
              alt="付款截图"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      )}

      {/* ── 详情弹窗 ─────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}  // 点遮罩关闭
      >
        {/*
          卡片：flex-col + max-h-[90vh] + overflow-hidden
          ├── Header：shrink-0，不参与滚动，关闭按钮永远可见
          └── Body：flex-1 + overflow-y-auto，长图在此滚动
        */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header — 固定，不滚动 */}
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-950">{reg.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">报名详情</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-950 hover:bg-gray-100 transition-colors"
              aria-label="关闭"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body — 可滚动 */}
          <div
            className="flex-1 overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
          >
            {/* 信息行 */}
            <div className="px-5 py-1">
              <Row label="姓名"   value={reg.name} />
              <Row label="性别"   value={GENDER_LABEL[reg.gender] || reg.gender} />
              <Row label="中羽等级" value={reg.skill_level ? `${reg.skill_level} 级` : null} />
              <Row label="报名人数" value={`${reg.quantity || 1} 人`} />
              <Row label="当前状态" value={STATUS_LABEL[reg.payment_status] || reg.payment_status} />
              <Row label="备注留言" value={reg.notes || null} />
            </div>

            {/* 付款截图 */}
            {reg.payment_screenshot ? (
              <div className="px-5 pb-5">
                <p className="text-xs text-gray-400 mb-2 mt-1">付款截图</p>
                <div
                  className="relative cursor-pointer group rounded-xl overflow-hidden border border-gray-100"
                  onClick={() => setFullscreen(true)}
                >
                  <img
                    src={reg.payment_screenshot}
                    alt="付款截图"
                    className="w-full h-auto group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                    <div className="bg-white/90 rounded-full p-1.5 shadow">
                      <ExternalLink size={13} className="text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 pb-5">
                <p className="text-xs text-gray-300 mt-1">无付款截图</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
