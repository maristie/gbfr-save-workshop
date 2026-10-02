import { INVENTORY_TERMS } from './inventory-terms.js'
import { MATERIAL_ITEM_TERMS } from './material-terms.js'

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', htmlLang: 'en' },
  { value: 'ja', label: '日本語', htmlLang: 'ja' },
  { value: 'zh-CN', label: '简体中文', htmlLang: 'zh-Hans' },
  { value: 'zh-TW', label: '繁體中文', htmlLang: 'zh-Hant' },
]

const LANGUAGE_KEY = 'gbfr-save-workshop-language'
const SUPPORTED_LANGUAGES = new Set(LANGUAGE_OPTIONS.map(({ value }) => value))
const LANGUAGE_INDEX = { ja: 0, 'zh-CN': 1, 'zh-TW': 2 }

// Each row is Japanese, Simplified Chinese, and Traditional Chinese, in that order.
const UI_TRANSLATIONS = {
  'SAVE FILE EDITOR': ['セーブデータ編集', '存档编辑器', '存檔編輯器'],
  'Relink Save Workshop home': ['Relink Save Workshop ホーム', 'Relink Save Workshop 首页', 'Relink Save Workshop 首頁'],
  'LOCAL MODE': ['ローカルモード', '本地模式', '本機模式'],
  Language: ['言語', '语言', '語言'],
  'Switch save': ['セーブを切り替える', '切换存档', '切換存檔'],
  'Open save': ['セーブを開く', '打开存档', '開啟存檔'],
  'FIELD KIT': ['フィールドキット', '战术工具', '戰術工具'],
  'WEB EDITION': ['ウェブ版', '网页版', '網頁版'],
  PROGRESSION: ['進行状況', '进度', '進度'],
  'Edit bag items.': ['所持品を編集。', '编辑背包物品。', '編輯背包物品。'],
  'STACKABLE ITEMS': ['スタック可能アイテム', '可堆叠物品', '可堆疊物品'],
  'Items and materials': ['アイテムと素材', '物品与素材', '物品與素材'],
  'Set quantities for stackable items, or add and remove Sigils and Wrightstones. The editor checks each changed record and the save checksum before download.': ['スタック可能なアイテムの数量を設定したり、ジーンや加護を追加・削除したりできます。ダウンロード前に変更レコードとセーブのチェックサムを検証します。', '设置可堆叠物品的数量，或添加、移除因子与辉石。下载前会检查每条更改记录和存档校验和。', '設定可堆疊物品的數量，或新增、移除因子與輝石。下載前會檢查每筆變更紀錄與存檔檢查碼。'],
  'Set quantities for existing materials, currency, consumables, and other stackable items. Only stacks already active in the save can be edited. The save field accepts 0–2,147,483,647.': ['所持している素材、通貨、消耗品などの数量を設定できます。セーブデータですでに有効なスタックのみ編集できます。保存フィールドは0～2,147,483,647に対応します。', '设置已有素材、货币、消耗品和其他可堆叠物品的数量。只能编辑存档中已启用的堆叠。存档字段范围为 0–2,147,483,647。', '設定已有素材、貨幣、消耗品與其他可堆疊物品的數量。只能編輯存檔中已啟用的堆疊。存檔欄位範圍為 0–2,147,483,647。'],
  'Search item names, IDs, hashes, or slot': ['アイテム名、ID、ハッシュ、スロットを検索', '搜索物品名称、ID、哈希或槽位', '搜尋物品名稱、ID、雜湊或欄位'],
  'Current amount': ['現在の数量', '当前数量', '目前數量'],
  'New amount': ['変更後の数量', '新数量', '新數量'],
  'Ready to apply': ['適用準備完了', '待应用', '待套用'],
  'Edit several amounts, then apply them together.': ['複数の数量を編集してから、一括で適用できます。', '可以先修改多个物品的数量，再一次性应用。', '可以先修改多個物品的數量，再一次套用。'],
  'Apply all amounts': ['すべての数量を適用', '应用所有数量', '套用所有數量'],
  'Apply item amounts first': ['先にアイテム数量を適用', '请先应用物品数量', '請先套用物品數量'],
  'Item amount applied.': ['アイテム数量を適用しました。', '已应用物品数量。', '已套用物品數量。'],
  'Item amounts applied.': ['アイテム数量を一括適用しました。', '已批量应用物品数量。', '已批次套用物品數量。'],
  'Item amounts unchanged.': ['アイテム数量に変更はありません。', '物品数量未更改。', '物品數量未變更。'],
  AMOUNT: ['数量', '数量', '數量'],
  Quantity: ['数量', '数量', '數量'],
  Unit: ['ユニット', '单位', '單位'],
  'active stacks': ['有効なスタック', '已启用堆叠', '已啟用堆疊'],
  editable: ['編集可能', '可编辑', '可編輯'],
  'Show more items': ['さらにアイテムを表示', '显示更多物品', '顯示更多物品'],
  'No matching bag items.': ['一致する所持品はありません。', '没有匹配的背包物品。', '沒有符合的背包物品。'],
  'Unavailable': ['利用不可', '不可用', '無法使用'],
  'Read-only: item or quantity fields are incomplete or ambiguous.': ['読み取り専用：アイテムまたは数量項目が不完全か、曖昧です。', '只读：物品或数量字段不完整或不明确。', '唯讀：物品或數量欄位不完整或不明確。'],
  'Mastery Points': ['マスタリーポイント', '精通点数', '精通點數'],
  'Set your Mastery Points.': ['マスタリーポイントを設定。', '设置精通点数。', '設定精通點數。'],
  'Choose the balance to keep in your save. The editor verifies the value before downloading the edited copy.': ['セーブデータに保存するポイント数を指定できます。編集済みコピーのダウンロード前に値を検証します。', '设置要保留在存档中的点数。下载编辑后的副本前会验证该数值。', '設定要保留在存檔中的點數。下載編輯後的副本前會驗證該數值。'],
  'PROFILE BALANCE': ['プロフィール残高', '个人资料余额', '個人資料餘額'],
  'CURRENT BALANCE': ['現在の残高', '当前余额', '目前餘額'],
  'NEW AMOUNT': ['新しい数量', '新数量', '新數量'],
  'Apply amount': ['数量を適用', '应用数量', '套用數量'],
  'Pending amount': ['変更予定の数量', '待应用数量', '待套用數量'],
  'Mastery Points are read-only in this save.': ['このセーブデータのマスタリーポイントは読み取り専用です。', '此存档中的精通点数为只读。', '此存檔中的精通點數為唯讀。'],
  'The value field is missing, duplicated, or incomplete.': ['値の項目がないか、重複または不完全です。', '数值字段缺失、重复或不完整。', '數值欄位缺少、重複或不完整。'],
  'Mastery Points amount unchanged.': ['マスタリーポイント数は変更されていません。', '精通点数未更改。', '精通點數未變更。'],
  'Mastery Points change queued.': ['マスタリーポイントの変更を保留しました。', '已暂存精通点数更改。', '已暫存精通點數變更。'],
  'The Mastery Points field is missing or ambiguous in this save.': ['このセーブデータのマスタリーポイント項目がないか、特定できません。', '此存档中的精通点数字段缺失或不明确。', '此存檔中的精通點數欄位缺少或不明確。'],
  'Couldn’t apply this change.': ['変更を適用できませんでした。', '无法应用此更改。', '無法套用這項變更。'],
  'Couldn’t open this save.': ['セーブを開けませんでした。', '无法打开此存档。', '無法開啟此存檔。'],
  Dismiss: ['閉じる', '关闭', '關閉'],
  'INDEPENDENT COMMUNITY TOOL · SAVE FILES NEVER LEAVE YOUR BROWSER': ['コミュニティ制作ツール · セーブデータはブラウザーの外に送信されません', '独立社区工具 · 存档不会离开浏览器', '獨立社群工具 · 存檔不會離開瀏覽器'],
  'DESIGNED FOR KEYBOARD, MOUSE & TOUCH': ['キーボード・マウス・タッチ操作に対応', '支持键盘、鼠标和触控操作', '支援鍵盤、滑鼠與觸控操作'],
  'Edit overmasteries. Set Mastery Points.': ['オーバーマスタリーを編集し、マスタリーポイントを設定。', '编辑角色强化属性，设置精通点数。', '編輯角色強化屬性，設定精通點數。'],
  'Read a Relink save, adjust overmastery stats and Mastery Points, edit existing stackable item quantities, add Sigils and Wrightstones, or choose equipment from the catalog. Then download a verified copy.': ['Relinkのセーブデータを読み込み、オーバーマスタリーやマスタリーポイント、所持アイテムの数量を調整し、ジーンや加護を追加・削除できます。検証済みのコピーをダウンロードしてください。', '读取 Relink 存档，调整角色强化属性、精通点数和已有物品数量，添加或移除因子与辉石。然后下载经过验证的副本。', '讀取 Relink 存檔，調整角色強化屬性、精通點數與已有物品數量，新增或移除因子與輝石。然後下載經過驗證的副本。'],
  'Read a Relink save, adjust overmastery stats and Mastery Points, add Sigils and Wrightstones, remove unassigned Sigils or inactive Wrightstones, or choose items by name from the catalog. Then download a verified copy.': ['Relinkのセーブデータを読み込み、オーバーマスタリーやマスタリーポイントを調整したり、ジーンや加護を追加・削除したり、カタログからアイテムを選択したりできます。検証済みのコピーをダウンロードしてください。', '读取 Relink 存档，调整角色强化属性和精通点数，添加或移除因子与辉石，也可从目录按名称选择物品。然后下载经过验证的副本。', '讀取 Relink 存檔，調整角色強化屬性與精通點數，新增或移除因子與輝石，也可從目錄依名稱選擇物品。然後下載經過驗證的副本。'],
  'Files stay on this device': ['ファイルはこの端末内に保存されます', '文件保留在此设备上', '檔案會保留在此裝置上'],
  'Original save stays untouched': ['元のセーブデータは変更されません', '原始存档不会被修改', '原始存檔不會被修改'],
  'Mastery Points, Sigils and Wrightstones': ['マスタリーポイント、ジーン、加護', '精通点数、因子与辉石', '精通點數、因子與輝石'],
  'Choose save file': ['セーブファイルを選択', '选择存档文件', '選擇存檔檔案'],
  'Choose or drop a save file': ['セーブファイルを選択またはドロップ', '选择或拖放存档文件', '選擇或拖放存檔檔案'],
  'Drop your save here': ['セーブをここにドロップ', '将存档拖放到此处', '將存檔拖放到此處'],
  'A readable': ['読み込み可能な', '可读取的', '可讀取的'],
  'save file': ['セーブファイル', '存档文件', '存檔檔案'],
  'or browse files': ['またはファイルを参照', '或浏览文件', '或瀏覽檔案'],
  'Private by design': ['プライバシーを重視', '隐私优先设计', '以隱私為設計核心'],
  'The save is parsed and edited locally; nothing is uploaded.': ['セーブデータは端末内で解析・編集され、アップロードされません。', '存档只在本地解析和编辑，不会上传。', '存檔只會在本機解析與編輯，不會上傳。'],
  'Save format reference': ['セーブ形式の資料', '存档格式参考', '存檔格式參考'],
  'Save format reference ↗': ['セーブ形式の資料 ↗', '存档格式参考 ↗', '存檔格式參考 ↗'],
  'Sigils': ['ジーン', '因子', '因子'],
  'Wrightstones': ['加護', '辉石', '輝石'],
  'Search item names, traits, or slot ID': ['アイテム名、特性、スロットIDを検索', '搜索物品名称、词条或槽位 ID', '搜尋物品名稱、詞條或欄位 ID'],
  'Create from item catalog': ['アイテムカタログから作成', '从物品目录创建', '從物品目錄建立'],
  'Select named items and traits. Their save hashes are filled in automatically. Trait combinations are not checked for in-game legality.': ['アイテムと特性を選択すると、セーブデータ用のハッシュが自動入力されます。特性の組み合わせがゲーム内で有効かは検証されません。', '选择物品和词条后会自动填入存档哈希。不会检查词条组合在游戏中是否合法。', '選擇物品與詞條後會自動填入存檔雜湊值。不會檢查詞條組合在遊戲中是否合法。'],
  'For selectable + Sigils, all cataloged traits are available as the second trait, including combinations produced by Sigil Synthesis outside the natural drop pool. Trait combinations are not checked for in-game legality.': ['第2特性を選べる＋付きジーンでは、自然ドロップの特性プール外でもジーン合成で作れる組み合わせに対応するため、カタログ内の全特性を第2特性に選択できます。ゲーム内で有効な組み合わせかは検証されません。', '对于可选副词条的“+”因子，副词条可以从全部已收录词条中选择，因此也能填写通过因子合成得到、但不在自然掉落词条池中的组合。不会检查组合在游戏中是否合法。', '對於可選副詞條的「+」因子，副詞條可以從全部已收錄詞條中選擇，因此也能填入透過因子合成取得、但不在自然掉落詞條池中的組合。不會檢查組合在遊戲中是否合法。'],
  'The item catalog is unavailable.': ['アイテムカタログを利用できません。', '物品目录不可用。', '物品目錄無法使用。'],
  'Choose a': ['選択：', '选择：', '選擇：'],
  'SECONDARY TRAIT': ['第2特性', '副词条', '副詞條'],
  'ADDITIONAL TRAIT 1': ['追加特性 1', '额外词条 1', '額外詞條 1'],
  'ADDITIONAL TRAIT 2': ['追加特性 2', '额外词条 2', '額外詞條 2'],
  'No additional trait': ['追加特性なし', '无额外词条', '無額外詞條'],
  'Optional': ['任意', '选填', '選填'],
  'SIGIL TYPE': ['ジーンの種類', '因子类型', '因子類型'],
  'WRIGHTSTONE TYPE': ['加護の種類', '辉石类型', '輝石類型'],
  QUANTITY: ['個数', '数量', '數量'],
  'SIGIL LEVEL': ['ジーンレベル', '因子等级', '因子等級'],
  'PRIMARY TRAIT': ['主特性', '主词条', '主詞條'],
  'PRIMARY TRAIT ·': ['主特性 ·', '主词条 ·', '主詞條 ·'],
  'Choose an item to see its primary trait': ['アイテムを選ぶと主特性が表示されます', '选择物品后显示主词条', '選擇物品後顯示主詞條'],
  'LEVEL 1': ['レベル 1', '等级 1', '等級 1'],
  'LEVEL 2': ['レベル 2', '等级 2', '等級 2'],
  'LEVEL 3': ['レベル 3', '等级 3', '等級 3'],
  'Add Sigil': ['ジーンを追加', '添加因子', '新增因子'],
  'Add Wrightstone': ['加護を追加', '添加辉石', '新增輝石'],
  'BAG INVENTORY': ['所持品', '背包物品', '背包物品'],
  'Add Sigils and Wrightstones.': ['ジーンと加護を追加。', '添加因子与辉石。', '新增因子與輝石。'],
  'Edit Sigils and Wrightstones.': ['ジーンと加護を編集。', '编辑因子与辉石。', '編輯因子與輝石。'],
  'Copy an entry, remove an unassigned Sigil or inactive Wrightstone, or choose one by name from the catalog. Hashes are filled in for you. Export verifies the changed records and checksum before download.': ['所持品を複製するか、未割り当てのジーンまたは無効状態の加護を削除するか、カタログから選択できます。ハッシュは自動入力され、ダウンロード前に変更レコードとチェックサムを検証します。', '复制已有物品、移除未分配的因子或未激活的辉石，或从目录按名称选择。哈希会自动填入，导出前会验证更改的记录和校验和。', '複製已有物品、移除未指派的因子或未啟用的輝石，或從目錄依名稱選擇。雜湊值會自動填入，下載前會驗證變更紀錄與檢查碼。'],
  'Copy an owned entry, delete unassigned Sigils or inactive Wrightstones, or choose one by name from the catalog. New copies go into an empty slot and are left unassigned.': ['所持品を複製するか、未割り当てのジーンまたは無効状態の加護を削除するか、カタログから選択できます。複製は空きスロットに入り、割り当てられません。', '复制已有物品、删除未分配的因子或未激活的辉石，或从目录按名称选择。副本会放入空槽位且不分配给角色。', '複製已有物品、刪除未指派的因子或未啟用的輝石，或從目錄依名稱選擇。副本會放入空欄位且不會指派給角色。'],
  'PENDING CHANGES': ['保留中の変更', '待处理更改', '待處理變更'],
  'This item cannot be safely removed.': ['このアイテムは安全に削除できません。', '无法安全移除此物品。', '無法安全移除此物品。'],
  'Remove queued item': ['追加予定のアイテムを削除', '移除待添加物品', '移除待新增物品'],
  'No bag additions queued.': ['追加するアイテムはありません。', '没有待添加的物品。', '沒有待新增的物品。'],
  'No bag changes queued.': ['所持品の変更はありません。', '没有待处理的背包更改。', '沒有待處理的背包變更。'],
  'Remove from bag': ['所持品から削除', '从背包移除', '從背包移除'],
  'Delete': ['削除', '删除', '刪除'],
  Undo: ['元に戻す', '撤销', '復原'],
  'Undo item removal': ['アイテム削除を元に戻す', '撤销移除物品', '復原物品移除'],
  'Only unassigned Sigils can be deleted.': ['未割り当てのジーンのみ削除できます。', '只能删除未分配的因子。', '只能刪除未指派的因子。'],
  'Only inactive Wrightstones can be deleted.': ['無効状態の加護のみ削除できます。', '只能删除未激活的辉石。', '只能刪除未啟用的輝石。'],
  'queued for removal': ['削除予定', '待移除', '待移除'],
  'active in source': ['元データで有効', '源数据中已激活', '來源資料中已啟用'],
  'fixed secondary': ['固定の第2特性', '固定副词条', '固定副詞條'],
  'selectable secondary': ['選択可能な第2特性', '可选副词条', '可選副詞條'],
  'Uncatalogued trait': ['未登録の特性', '未收录词条', '未收錄詞條'],
  'Uncatalogued Sigil': ['未登録のジーン', '目录中未收录的因子', '目錄中未收錄的因子'],
  'Uncatalogued Wrightstone': ['未登録の加護', '目录中未收录的辉石', '目錄中未收錄的輝石'],
  'Uncatalogued item': ['未登録のアイテム', '目录中未收录的物品', '目錄中未收錄的物品'],
  'OVERMASTERY SLOT': ['オーバーマスタリー枠', '角色强化槽位', '角色強化欄位'],
  Unavailable: ['利用不可', '不可用', '無法使用'],
  'The paired save fields are incomplete.': ['対応するセーブデータの項目が不足しています。', '配对的存档字段不完整。', '配對的存檔欄位不完整。'],
  'Open slot': ['空きスロット', '空槽位', '空欄位'],
  'Choose a stat to fill this slot.': ['能力を選んでスロットを埋めてください。', '选择属性以填入此槽位。', '選擇屬性以填入此欄位。'],
  'Unknown stat': ['不明な能力', '未知属性', '未知屬性'],
  'stored ID': ['保存ID', '已存储 ID', '已儲存 ID'],
  'Community raw override': ['コミュニティ独自の生値設定', '社区原始值覆盖', '社群原始值覆寫'],
  STAT: ['能力', '属性', '屬性'],
  LEVEL: ['レベル', '等级', '等級'],
  Standard: ['標準', '标准', '標準'],
  'Compatibility ID': ['互換ID', '兼容 ID', '相容 ID'],
  'Unrecognized existing stat': ['認識できない既存能力', '未识别的现有属性', '未識別的現有屬性'],
  preserved: ['保持', '保留', '保留'],
  'Invalid stored level': ['保存レベルが無効', '已存储等级无效', '已儲存等級無效'],
  'Empty slot': ['空きスロット', '空槽位', '空欄位'],
  'Community raw preset': ['コミュニティ原始値プリセット', '社区原始值预设', '社群原始值預設'],
  'Choose a stat and level': ['能力とレベルを選択', '选择属性和等级', '選擇屬性與等級'],
  Edited: ['編集済み', '已编辑', '已編輯'],
  'Clear slot': ['スロットを空にする', '清空槽位', '清空欄位'],
  'Download edited save': ['編集済みセーブをダウンロード', '下载已编辑的存档', '下載已編輯的存檔'],
  'No changes to download': ['ダウンロードする変更はありません', '没有可下载的更改', '沒有可下載的變更'],
  'Checksum needs review': ['チェックサムの確認が必要', '需要检查校验和', '需要檢查檢查碼'],
  'LOADED SAVE': ['読み込み済みセーブ', '已加载存档', '已載入存檔'],
  'Save data v': ['セーブデータ バージョン ', '存档数据版本 ', '存檔資料版本 '],
  characters: ['人のキャラクター', '名角色', '名角色'],
  'Checksum verified': ['チェックサム検証済み', '校验和已验证', '檢查碼已驗證'],
  'Checksum mismatch': ['チェックサム不一致', '校验和不匹配', '檢查碼不符'],
  'Open another': ['別のファイルを開く', '打开其他存档', '開啟其他存檔'],
  'This save’s checksum does not match.': ['このセーブデータのチェックサムが一致しません。', '此存档的校验和不匹配。', '此存檔的檢查碼不符。'],
  'Editing is disabled so the browser will not make a damaged file worse. Re-export a clean save and try again.': ['破損を防ぐため編集を無効にしました。正常なセーブデータを再度エクスポートしてからお試しください。', '为避免进一步损坏文件，编辑已停用。请重新导出正常存档后再试。', '為避免檔案進一步損壞，已停用編輯。請重新匯出正常存檔後再試。'],
  'Save editor tools': ['セーブ編集ツール', '存档编辑工具', '存檔編輯工具'],
  Overmastery: ['オーバーマスタリー', '角色强化', '角色強化'],
  'Bag items': ['所持品', '背包物品', '背包物品'],
  'CHARACTER ROSTER': ['キャラクター一覧', '角色列表', '角色清單'],
  Characters: ['キャラクター', '角色', '角色'],
  'Find a character': ['キャラクターを検索', '搜索角色', '搜尋角色'],
  'No matching characters.': ['該当するキャラクターがいません。', '没有匹配的角色。', '沒有符合條件的角色。'],
  'No supported characters found.': ['対応しているキャラクターが見つかりません。', '未找到已识别的角色。', '找不到已識別的角色。'],
  'Select a character to edit their save slots.': ['キャラクターを選んでセーブスロットを編集してください。', '选择角色以编辑其存档槽位。', '選擇角色以編輯其存檔欄位。'],
  'SAVED CHARACTER': ['保存キャラクター', '已保存角色', '已儲存角色'],
  UNIT: ['ユニット', '单位', '單位'],
  'Set all four saved slots. The 0x03FF community preset is experimental.': ['保存済みの4つのスロットを設定します。0x03FFのコミュニティプリセットは実験的な機能です。', '设置全部四个已保存槽位。0x03FF 社区预设为实验性功能。', '設定全部四個已儲存欄位。0x03FF 社群預設為實驗性功能。'],
  'This unit is not mapped as a playable character.': ['このユニットはプレイアブルキャラクターとして登録されていません。', '此单位未映射为可操作角色。', '此單位未對應為可操作角色。'],
  'Its saved overmastery slots are read-only.': ['保存されたオーバーマスタリー枠は読み取り専用です。', '其已保存的角色强化槽位为只读。', '其已儲存的角色強化欄位為唯讀。'],
  'Some slots are read-only.': ['読み取り専用のスロットがあります。', '部分槽位为只读。', '部分欄位為唯讀。'],
  'One or more attribute/level pairs are missing or ambiguous in this save.': ['このセーブデータでは、能力とレベルの組み合わせが不足または不明確です。', '此存档中的一个或多个属性/等级字段缺失或不明确。', '此存檔中的一個或多個屬性／等級欄位缺漏或不明確。'],
  'Select a character': ['キャラクターを選択', '选择角色', '選擇角色'],
  'Choose a row from the roster to inspect its overmastery slots.': ['一覧からキャラクターを選び、オーバーマスタリー枠を確認してください。', '从列表中选择角色以查看其强化槽位。', '從清單中選擇角色以檢視其強化欄位。'],
  'No overmastery edits': ['オーバーマスタリーの編集なし', '没有角色强化更改', '沒有角色強化變更'],
  'Reset edits': ['編集をリセット', '重置更改', '重設變更'],
  'All edits reset.': ['すべての編集をリセットしました。', '已重置所有更改。', '已重設所有變更。'],
  'Export creates a new file. Keep your original save as a backup until the game loads the edited copy.': ['エクスポートすると新しいファイルが作成されます。ゲームで編集済みファイルを読み込めるまで、元のセーブデータをバックアップとして保管してください。', '导出会创建新文件。确认游戏能读取编辑后的存档前，请保留原始存档备份。', '匯出會建立新檔案。確認遊戲能讀取編輯後的存檔前，請保留原始存檔備份。'],
  'Slot counter or serial records are ambiguous.': ['スロット数またはシリアル番号の記録が不明確です。', '槽位计数器或序列号记录不明确。', '欄位計數器或序號紀錄不明確。'],
  'This item type is read-only for this save.': ['このセーブデータでは、この種類のアイテムは読み取り専用です。', '此存档中的该物品类型为只读。', '此存檔中的此物品類型為唯讀。'],
  'Adding copies is disabled for this item type in this save.': ['このセーブデータでは、この種類のアイテムを複製できません。', '此存档中无法复制此类物品。', '此存檔中無法複製此類物品。'],
  'Attribute field is missing, duplicated, or not scalar.': ['能力フィールドが見つからないか、重複しているか、単一の値ではありません。', '属性字段缺失、重复或不是单值。', '屬性欄位缺漏、重複或不是單一值。'],
  'Level field is missing, duplicated, or not scalar.': ['レベルフィールドが見つからないか、重複しているか、単一の値ではありません。', '等级字段缺失、重复或不是单值。', '等級欄位缺漏、重複或不是單一值。'],
  'Community raw override 0x03FF; behavior can vary by game version.': ['コミュニティ独自の生値設定 0x03FF。動作はゲームバージョンによって異なる場合があります。', '社区原始值覆盖 0x03FF；效果可能因游戏版本而异。', '社群原始值覆寫 0x03FF；效果可能因遊戲版本而異。'],
  'Existing compatibility hash': ['既存の互換ハッシュ', '现有兼容哈希', '現有相容雜湊值'],
  'Choose an owned entry to add a matching copy. New copies go into an existing empty slot and are left unassigned.': ['所持しているアイテムを選ぶと同じものを追加できます。複製は既存の空きスロットに入り、装備先は設定されません。', '选择已有物品即可添加相同副本。副本会放入现有空槽位且不分配给角色。', '選擇已有物品即可新增相同副本。副本會放入現有空欄位且不會指派給角色。'],
  'Add copy': ['複製を追加', '添加副本', '新增副本'],
  'No matching bag entries.': ['該当する所持品はありません。', '没有匹配的背包物品。', '沒有符合條件的背包物品。'],
  'Refine the item name or trait search to narrow the list.': ['アイテム名または特性で検索し、一覧を絞り込んでください。', '使用物品名称或词条搜索以缩小列表范围。', '使用物品名稱或詞條搜尋以縮小清單範圍。'],
  'Level': ['レベル', '等级', '等級'],
  'No trait values recognized': ['認識された特性値はありません', '没有可识别的词条值', '沒有可識別的詞條值'],
  'assigned in source': ['元データで割り当て済み', '源物品已分配', '來源物品已指派'],
  'bag item': ['所持品', '背包物品', '背包物品'],
  'Community raw override · 0x03FF': ['コミュニティ独自の生値設定 · 0x03FF', '社区原始值覆盖 · 0x03FF', '社群原始值覆寫 · 0x03FF'],
  'The save slot is incomplete.': ['セーブスロットが不完全です。', '存档槽位不完整。', '存檔欄位不完整。'],
  'This file is too small to be a Relink save.': ['Relinkのセーブデータとしてはファイルサイズが小さすぎます。', '此文件过小，不是有效的 Relink 存档。', '此檔案太小，不是有效的 Relink 存檔。'],
  'No character records were found. This save format or game version may not be supported.': ['キャラクターの記録が見つかりません。このセーブ形式またはゲームバージョンには対応していない可能性があります。', '未找到角色记录。可能不支持此存档格式或游戏版本。', '找不到角色紀錄。可能不支援此存檔格式或遊戲版本。'],
  'Duplicate character records were found; editing is disabled because slot ownership is ambiguous.': ['キャラクター記録が重複しています。スロットの所有者を特定できないため、編集を無効にしました。', '发现重复的角色记录；由于无法确定槽位归属，编辑已停用。', '發現重複的角色紀錄；由於無法確定欄位歸屬，已停用編輯。'],
  'The save hash seed could not be identified unambiguously; editing is disabled for safety.': ['セーブのハッシュシードを特定できません。安全のため編集を無効にしました。', '无法明确识别存档哈希种子；为确保安全，编辑已停用。', '無法明確識別存檔雜湊種子；為確保安全，已停用編輯。'],
  'The checksum region is invalid.': ['チェックサム領域が無効です。', '校验和区域无效。', '檢查碼區域無效。'],
  'The input save checksum is invalid; editing is disabled for safety.': ['入力されたセーブデータのチェックサムが無効です。安全のため編集を無効にしました。', '输入存档的校验和无效；为确保安全，编辑已停用。', '輸入存檔的檢查碼無效；為確保安全，已停用編輯。'],
  'There are no changes to download.': ['ダウンロードする変更はありません。', '没有可下载的更改。', '沒有可下載的變更。'],
  'Checksum verification failed. No file was downloaded.': ['チェックサムの検証に失敗しました。ファイルはダウンロードされませんでした。', '校验和验证失败。未下载文件。', '檢查碼驗證失敗。未下載檔案。'],
  'Choose an item from the catalog.': ['カタログからアイテムを選択してください。', '请从目录中选择物品。', '請從目錄中選擇物品。'],
  'Quantity must be a positive whole number.': ['個数は1以上の整数で入力してください。', '数量必须为正整数。', '數量必須為正整數。'],
  'Item quantity must be a whole number from 0 to 2,147,483,647.': ['アイテム数量は0から2,147,483,647までの整数で入力してください。', '物品数量必须是 0 到 2,147,483,647 之间的整数。', '物品數量必須是 0 到 2,147,483,647 之間的整數。'],
  'This bag item quantity cannot be safely changed.': ['この所持品の数量は安全に変更できません。', '无法安全修改此背包物品的数量。', '無法安全修改此背包物品的數量。'],
  'Item amount unchanged.': ['アイテム数量は変更されていません。', '物品数量未更改。', '物品數量未變更。'],
  'Item amount change queued.': ['アイテム数量の変更を保留しました。', '已暂存物品数量更改。', '已暫存物品數量變更。'],
  'A bag item quantity was queued more than once.': ['所持品数量の変更が重複しています。', '同一背包物品数量被重复暂存。', '同一背包物品數量被重複暫存。'],
  'The selected item has no recognized primary trait.': ['選択したアイテムの主特性を認識できません。', '无法识别所选物品的主词条。', '無法識別所選物品的主詞條。'],
  'Choose a secondary trait available for the selected Sigil.': ['選択したジーンで使用できる第2特性を選択してください。', '请选择所选因子可用的副词条。', '請選擇所選因子可用的副詞條。'],
  'This Sigil requires its fixed secondary trait.': ['このジーンには固定の第2特性が必要です。', '此因子必须使用其固定副词条。', '此因子必須使用其固定副詞條。'],
  'Read-back verification failed. No file was downloaded.': ['読み戻し検証に失敗しました。ファイルはダウンロードされませんでした。', '回读验证失败。未下载文件。', '讀回驗證失敗。未下載檔案。'],
  'Choose an item from the catalog': ['カタログからアイテムを選択', '从目录中选择物品', '從目錄中選擇物品'],
  'fixed': ['固定', '固定', '固定'],
  'selectable': ['選択可能', '可选', '可選'],
  'copied from': ['複製元：', '复制自', '複製自'],
  'catalog selection': ['カタログから選択', '从目录选择', '從目錄選擇'],
  'traits': ['個の特性', '个词条', '個詞條'],
  'Level 1': ['レベル 1', '等级 1', '等級 1'],
}

const CHARACTER_NAMES = {
  Gran: ['グラン', '格兰', '格蘭'],
  Djeeta: ['ジータ', '姬塔', '姬塔'],
  Katalina: ['カタリナ', '卡塔莉娜', '卡塔莉娜'],
  Rackam: ['ラカム', '拉卡姆', '拉卡姆'],
  Io: ['イオ', '伊欧', '伊歐'],
  Eugen: ['オイゲン', '欧根', '歐根'],
  Rosetta: ['ロゼッタ', '罗塞塔', '羅塞塔'],
  Ghandagoza: ['ガンダゴウザ', '刚达戈萨', '剛達戈薩'],
  Ferry: ['フェリ', '菲莉', '菲莉'],
  Lancelot: ['ランスロット', '兰斯洛特', '蘭斯洛特'],
  Vane: ['ヴェイン', '威恩', '威恩'],
  Percival: ['パーシヴァル', '帕希瓦尔', '帕希瓦爾'],
  Siegfried: ['ジークフリート', '齐格飞', '齊格飛'],
  Charlotta: ['シャルロッテ', '夏洛特', '夏洛特'],
  Tweyen: ['ソーン', '妥恩', '妥恩'],
  Yodarha: ['ヨダルラーハ', '尤达尔拉哈', '尤達爾拉哈'],
  Narmaya: ['ナルメア', '娜露梅', '娜露梅'],
  Gallanza: ['ガランツァ', '加兰查', '加蘭查'],
  Zeta: ['ゼタ', '泽塔', '澤塔'],
  Id: ['イド', '伊德', '伊德'],
  Vaseraga: ['バザラガ', '巴萨拉卡', '巴薩拉卡'],
  Cagliostro: ['カリオストロ', '卡莉奥丝特罗', '卡莉奧絲特羅'],
  Sandalphon: ['サンダルフォン', '桑达尔冯', '桑達爾馮'],
  Seofon: ['シエテ', '希耶提', '希耶提'],
  Fediel: ['フェディエル', '菲迪艾尔', '菲迪艾爾'],
  Beatrix: ['ベアトリクス', '贝阿朵莉丝', '貝阿朵莉絲'],
  Maglielle: ['マギラフリラ', '玛琪拉芙丽拉', '瑪琪拉芙麗拉'],
  Eustace: ['ユーステス', '尤斯提斯', '尤斯提斯'],
  Fraux: ['フラウ', '芙劳', '芙勞'],
}

const STAT_NAMES = {
  Attack: ['攻撃力', '攻击力', '攻擊力'],
  HP: ['HP', 'HP', 'HP'],
  'Critical Hit Rate': ['クリティカル確率', '暴击率', '暴擊率'],
  'Stun Power': ['スタン値', '昏厥值', '昏厥值'],
  'Skill Damage': ['アビリティダメージ', '技能伤害', '技能傷害'],
  'Skybound Art Damage': ['奥義ダメージ', '奥义伤害', '奧義傷害'],
  'Chain Burst Damage': ['チェインバーストダメージ', '连锁爆发伤害', '連鎖爆發傷害'],
  'Normal Attack Damage Cap': ['通常攻撃ダメージ上限', '普通攻击伤害上限', '普通攻擊傷害上限'],
  'Skill Damage Cap': ['アビリティダメージ上限', '技能伤害上限', '技能傷害上限'],
  'Skybound Art Damage Cap': ['奥義ダメージ上限', '奥义伤害上限', '奧義傷害上限'],
  'Healing Cap': ['回復上限', '回复上限', '回復上限'],
}

const GENERIC_TERMS = {
  Sigil: ['ジーン', '因子', '因子'],
  Wrightstone: ['加護', '辉石', '輝石'],
}

// Wrightstone type names use the Japanese 加護 terminology.
const WRIGHTSTONE_NAMES = {
  'Dread Wrightstone': ['畏怖の加護', '恐惧辉石（Dread Wrightstone）', '恐懼輝石（Dread Wrightstone）'],
  'Vitality Wrightstone': ['息吹の加護', '生命辉石（Vitality Wrightstone）', '生命輝石（Vitality Wrightstone）'],
  'Fortification Wrightstone': ['鎮守の加護', '坚固辉石（Fortification Wrightstone）', '堅固輝石（Fortification Wrightstone）'],
  'Sequestration Wrightstone': ['隔絶の加護', '隔绝辉石（Sequestration Wrightstone）', '隔絕輝石（Sequestration Wrightstone）'],
}

export function normalizeLanguage(language) {
  return SUPPORTED_LANGUAGES.has(language) ? language : 'en'
}

export function initialLanguage() {
  try {
    return normalizeLanguage(window.localStorage.getItem(LANGUAGE_KEY))
  } catch {
    return 'en'
  }
}

export function saveLanguage(language) {
  try {
    window.localStorage.setItem(LANGUAGE_KEY, normalizeLanguage(language))
  } catch {
    // The current selection still works if storage is disabled.
  }
}

export function localizeCharacter(name, language) {
  const index = LANGUAGE_INDEX[normalizeLanguage(language)]
  return index === undefined ? name : CHARACTER_NAMES[name]?.[index] ?? name
}

export function characterSearchNames(name) {
  return [name, ...(CHARACTER_NAMES[name] ?? [])]
}

export function localizeInventoryTerm(name, kind, language) {
  const normalizedLanguage = normalizeLanguage(language)
  if (normalizedLanguage === 'en') return name
  if (kind === 'wrightstone') return WRIGHTSTONE_NAMES[name]?.[LANGUAGE_INDEX[normalizedLanguage]] ?? name
  const collection = kind === 'trait' ? INVENTORY_TERMS.traits : INVENTORY_TERMS.sigils
  return collection[name]?.[normalizedLanguage] ?? name
}

export function allInventoryTermNames(name, kind) {
  if (kind === 'wrightstone') return [name, ...(WRIGHTSTONE_NAMES[name] ?? [])]
  const collection = kind === 'trait' ? INVENTORY_TERMS.traits : INVENTORY_TERMS.sigils
  return [name, ...Object.values(collection[name] ?? {})]
}

export function localizeMaterialItem(name, language) {
  const normalizedLanguage = normalizeLanguage(language)
  if (normalizedLanguage === 'en') return name

  const wrightstone = name.match(/^(Dread|Vitality|Fortification|Sequestration) Wrightstone \(ITEM_[^)]+\)$/)
  if (wrightstone) return localizeInventoryTerm(`${wrightstone[1]} Wrightstone`, 'wrightstone', normalizedLanguage)

  return normalizedLanguage === 'ja' ? MATERIAL_ITEM_TERMS[name] ?? name : name
}

export function allMaterialItemNames(name, language) {
  return [...new Set([name, localizeMaterialItem(name, language)])]
}

function translateDynamicText(text, language) {
  const index = LANGUAGE_INDEX[language]
  if (index === undefined) return text

  let match = text.match(/^(.*) · (fixed secondary|selectable secondary)$/)
  if (match) {
    const secondary = UI_TRANSLATIONS[match[2]]?.[index] ?? match[2]
    return `${localizeInventoryTerm(match[1], 'sigil', language)} · ${secondary}`
  }
  match = text.match(/^Choose a (Sigil|Wrightstone)$/)
  if (match) return [`${match[1] === 'Sigil' ? 'ジーン' : '加護'}を選択`, `${match[1] === 'Sigil' ? '选择因子' : '选择辉石'}`, `${match[1] === 'Sigil' ? '選擇因子' : '選擇輝石'}`][index]
  match = text.match(/^(\d+) items? queued$/)
  if (match) return [
    `${match[1]} 件を追加予定`,
    `已排队 ${match[1]} 件物品`,
    `已排入佇列 ${match[1]} 件物品`,
  ][index]
  match = text.match(/^(\d+) changes? queued$/)
  if (match) return [`${match[1]} 件の変更を保留中`, `已暂存 ${match[1]} 项更改`, `已暫存 ${match[1]} 項變更`][index]
  match = text.match(/^Read-back verification failed for bag item quantity in unit (\d+)\.$/)
  if (match) return [`ユニット ${match[1]} のアイテム数量を読み戻し検証できませんでした。`, `无法验证单位 ${match[1]} 的物品数量回读值。`, `無法驗證單位 ${match[1]} 的物品數量讀回值。`][index]
  match = text.match(/^(\d+)\/(\d+) filled$/)
  if (match) return [`${match[1]}/${match[2]} 個設定済み`, `已填入 ${match[1]}/${match[2]}`, `已填入 ${match[1]}/${match[2]}`][index]
  match = text.match(/^(.+) · (\d+)\/(\d+) filled$/)
  if (match) return `${match[1]} · ${translateDynamicText(`${match[2]}/${match[3]} filled`, language)}`
  match = text.match(/^Sigil Lv (\d+)$/)
  if (match) return [`ジーン Lv ${match[1]}`, `因子等级 ${match[1]}`, `因子等級 ${match[1]}`][index]
  match = text.match(/^Serial (\d+)$/)
  if (match) return [`シリアル ${match[1]}`, `序列号 ${match[1]}`, `序號 ${match[1]}`][index]
  match = text.match(/^Lv (\d+)$/)
  if (match) return [`Lv ${match[1]}`, `等级 ${match[1]}`, `等級 ${match[1]}`][index]
  match = text.match(/^T(\d+) (.+) · Lv (\d+)$/)
  if (match) return [`特性${match[1]} ${localizeInventoryTerm(match[2], 'trait', language)} · Lv ${match[3]}`, `词条${match[1]} ${localizeInventoryTerm(match[2], 'trait', language)} · Lv ${match[3]}`, `詞條${match[1]} ${localizeInventoryTerm(match[2], 'trait', language)} · Lv ${match[3]}`][index]
  match = text.match(/^(Sigil Lv \d+|Serial \d+) · Unit (\d+) · (assigned in source|bag item|queued for removal|active in source)$/)
  if (match) {
    const title = translateDynamicText(match[1], language)
    const owner = UI_TRANSLATIONS[match[3]]?.[index] ?? match[3]
    return [`${title} · ユニット ${match[2]} · ${owner}`, `${title} · 单位 ${match[2]} · ${owner}`, `${title} · 單位 ${match[2]} · ${owner}`][index]
  }
  match = text.match(/^([\d,]+) in bag · ([\d,]+) empty slots$/)
  if (match) return [`所持品 ${match[1]} 個 · 空き ${match[2]} スロット`, `背包中 ${match[1]} 件 · 空槽位 ${match[2]} 个`, `背包中 ${match[1]} 件 · 空欄位 ${match[2]} 個`][index]
  match = text.match(/^Showing 100 of ([\d,]+) matches\. Refine the item name or trait search to narrow the list\.$/)
  if (match) return [`${match[1]} 件中100件を表示中。名前や特性を検索して絞り込んでください。`, `显示 ${match[1]} 条匹配结果中的前 100 条。请按物品名称或词条缩小范围。`, `顯示 ${match[1]} 筆符合結果中的前 100 筆。請依物品名稱或詞條縮小範圍。`][index]
  match = text.match(/^Showing ([\d,]+) of ([\d,]+) item matches\.$/)
  if (match) return [`${match[2]} 件中${match[1]}件を表示中`, `已显示 ${match[1]} 条，共 ${match[2]} 条匹配结果`, `已顯示 ${match[1]} 筆，共 ${match[2]} 筆符合結果`][index]
  match = text.match(/^Level (\d+) · (.+)$/)
  if (match) return [`レベル ${match[1]} · ${match[2]}`, `等级 ${match[1]} · ${match[2]}`, `等級 ${match[1]} · ${match[2]}`][index]
  match = text.match(/^LV (\d+)(.*)$/)
  if (match) return [`Lv ${match[1]}${match[2]}`, `等级 ${match[1]}${match[2]}`, `等級 ${match[1]}${match[2]}`][index]
  match = text.match(/^(\d+) overmastery slots?(?: · (\d+) bag additions?)?$/)
  if (match) return [
    `オーバーマスタリー枠 ${match[1]} 件${match[2] ? ` · 所持品の追加 ${match[2]} 件` : ''}`,
    `角色强化槽位 ${match[1]} 项${match[2] ? ` · 背包新增 ${match[2]} 项` : ''}`,
    `角色強化欄位 ${match[1]} 項${match[2] ? ` · 背包新增 ${match[2]} 項` : ''}`,
  ][index]
  match = text.match(/^(\d+) traits$/)
  if (match) return [`特性 ${match[1]} 件`, `${match[1]} 个词条`, `${match[1]} 個詞條`][index]
  match = text.match(/^(\d+) characters$/)
  if (match) return [`キャラクター ${match[1]} 人`, `${match[1]} 名角色`, `${match[1]} 名角色`][index]
  match = text.match(/^ · (\d+) characters$/)
  if (match) return [` · キャラクター ${match[1]} 人`, ` · ${match[1]} 名角色`, ` · ${match[1]} 名角色`][index]
  match = text.match(/^·\s*(\d+) characters$/)
  if (match) return [`· キャラクター ${match[1]} 人`, `· ${match[1]} 名角色`, `· ${match[1]} 名角色`][index]
  match = text.match(/^Unit (\d+)$/)
  if (match) return [`ユニット ${match[1]}`, `单位 ${match[1]}`, `單位 ${match[1]}`][index]
  match = text.match(/^UNIT (\d+)$/)
  if (match) return [`ユニット ${match[1]}`, `单位 ${match[1]}`, `單位 ${match[1]}`][index]
  match = text.match(/^(\d+) empty slots$/)
  if (match) return [`空きスロット ${match[1]} 個`, `空槽位 ${match[1]} 个`, `空欄位 ${match[1]} 個`][index]
  match = text.match(/^(Lv \d+|\d+ traits) · (copied from (\d+)|catalog selection)$/)
  if (match) {
    const itemSummary = translateDynamicText(match[1], language)
    const source = match[3]
      ? [`${match[3]} から複製`, `复制自 ${match[3]}`, `複製自 ${match[3]}`][index]
      : UI_TRANSLATIONS['catalog selection'][index]
    return `${itemSummary} · ${source}`
  }
  match = text.match(/^Community raw override · 0x03FF$/)
  if (match) return [`コミュニティ独自の生値設定 · 0x03FF`, `社区原始值覆盖 · 0x03FF`, `社群原始值覆寫 · 0x03FF`][index]
  match = text.match(/^Compatibility ID · (0x[0-9A-F]+)$/)
  if (match) return `${UI_TRANSLATIONS['Compatibility ID'][index]} · ${match[1]}`
  match = text.match(/^The stored level (0x[0-9A-F]+) is invalid and will be preserved\.$/)
  if (match) return [`保存レベル ${match[1]} は無効です。値は保持されます。`, `已存储等级 ${match[1]} 无效，将予以保留。`, `已儲存等級 ${match[1]} 無效，將予以保留。`][index]
  match = text.match(/^Stored ID (0x[0-9A-F]+) will be preserved\.$/)
  if (match) return [`保存ID ${match[1]} は保持されます。`, `已存储 ID ${match[1]} 将予以保留。`, `已儲存 ID ${match[1]} 將予以保留。`][index]
  match = text.match(/^Unrecognized existing stat · (0x[0-9A-F]+) \(preserved\)$/)
  if (match) return [`認識できない既存能力 · ${match[1]}（保持）`, `未识别的现有属性 · ${match[1]}（保留）`, `未識別的現有屬性 · ${match[1]}（保留）`][index]
  match = text.match(/^Only (\d+) empty (Sigil|Wrightstone) slots remain\.$/)
  if (match) {
    const item = GENERIC_TERMS[match[2]]?.[index] ?? match[2]
    return [`空きスロットは残り${match[1]}個です（${item}）。`, `仅剩 ${match[1]} 个${item}槽位。`, `僅剩 ${match[1]} 個${item}欄位。`][index]
  }
  match = text.match(/^There are no reusable empty (Sigil|Wrightstone) slots left\.$/)
  if (match) {
    const item = GENERIC_TERMS[match[1]]?.[index] ?? match[1]
    return [`再利用できる空きスロット（${item}）はありません。`, `没有可重复使用的空闲${item}槽位。`, `沒有可重複使用的空閒${item}欄位。`][index]
  }
  match = text.match(/^Unrecognized stored level (0x[0-9A-F]+)\.$/)
  if (match) return [`認識できない保存レベル ${match[1]}。`, `未识别的已存储等级 ${match[1]}。`, `未識別的已儲存等級 ${match[1]}。`][index]
  match = text.match(/^Unrecognized stat (0x[0-9A-F]+); its data will be preserved unless this slot is changed\.$/)
  if (match) return [`認識できない能力 ${match[1]}。このスロットを変更しない限りデータは保持されます。`, `未识别的属性 ${match[1]}；除非更改此槽位，否则会保留其数据。`, `未識別的屬性 ${match[1]}；除非變更此欄位，否則會保留其資料。`][index]
  match = text.match(/^Not enough empty (sigil|Wrightstone) slots: need (\d+), have (\d+)\.$/)
  if (match) {
    const item = GENERIC_TERMS[match[1] === 'sigil' ? 'Sigil' : 'Wrightstone']?.[index] ?? match[1]
    return [`${item}の空きスロットが不足しています。必要数：${match[2]}、利用可能：${match[3]}。`, `${item}空槽位不足：需要 ${match[2]} 个，可用 ${match[3]} 个。`, `${item}空欄位不足：需要 ${match[2]} 個，可用 ${match[3]} 個。`][index]
  }
  match = text.match(/^Read-back verification failed for (.+)\.$/)
  if (match) return [`${match[1]} の読み戻し検証に失敗しました。`, `${match[1]} 的回读验证失败。`, `${match[1]} 的讀回驗證失敗。`][index]
  match = text.match(/^Slot (\d+) for (.+) is incomplete\.$/)
  if (match) return [`${match[2]} のスロット ${match[1]} は不完全です。`, `${match[2]} 的槽位 ${match[1]} 不完整。`, `${match[2]} 的欄位 ${match[1]} 不完整。`][index]
  match = text.match(/^· (\d+) bag changes?$/)
  if (match) return [`· 所持品の変更 ${match[1]} 件`, `· 背包更改 ${match[1]} 项`, `· 背包變更 ${match[1]} 項`][index]
  match = text.match(/^(\d+) changes? queued$/)
  if (match) return [`${match[1]} 件の変更を保留中`, `已排队 ${match[1]} 项更改`, `已排隊 ${match[1]} 項變更`][index]
  match = text.match(/^Use a whole number from 0 to ([\d,]+)\.$/)
  if (match) return [`0から${match[1]}までの整数を入力してください。`, `请输入 0 到 ${match[1]} 之间的整数。`, `請輸入 0 到 ${match[1]} 之間的整數。`][index]
  match = text.match(/^Mastery Points must be a whole number from 0 to ([\d,]+)\.$/)
  if (match) return [`マスタリーポイントは0から${match[1]}までの整数で入力してください。`, `精通点数必须是 0 到 ${match[1]} 之间的整数。`, `精通點數必須是 0 到 ${match[1]} 之間的整數。`][index]
  match = text.match(/^Downloaded (.+); checksum, (\d+) overmastery edits, (\d+) bag additions, (\d+) bag removals, and (\d+) Mastery Points edits verified\.$/)
  if (match) return [
    `${match[1]} をダウンロードしました。チェックサム、オーバーマスタリーの変更 ${match[2]} 件、所持品の追加 ${match[3]} 件と削除 ${match[4]} 件、マスタリーポイントの変更 ${match[5]} 件を検証しました。`,
    `已下载 ${match[1]}。校验和、角色强化更改 ${match[2]} 项、背包新增 ${match[3]} 项及移除 ${match[4]} 项、精通点数更改 ${match[5]} 项均已验证。`,
    `已下載 ${match[1]}。檢查碼、角色強化變更 ${match[2]} 項、背包新增 ${match[3]} 項及移除 ${match[4]} 項、精通點數變更 ${match[5]} 項均已驗證。`,
  ][index]
  match = text.match(/^The (sigil|wrightstone) slot counter or serial records are ambiguous, so this save cannot be edited safely\.$/)
  if (match) return [`${match[1] === 'sigil' ? 'ジーン' : '加護'}のスロット数またはシリアル記録が不明確なため、このセーブは安全に編集できません。`, `由于${match[1] === 'sigil' ? '因子' : '辉石'}槽位计数器或序列号记录不明确，无法安全编辑此存档。`, `由於${match[1] === 'sigil' ? '因子' : '輝石'}欄位計數器或序號紀錄不明確，無法安全編輯此存檔。`][index]
  return text
}

export function localizeText(text, language) {
  const normalizedLanguage = normalizeLanguage(language)
  const index = LANGUAGE_INDEX[normalizedLanguage]
  if (index === undefined) return text

  const ui = UI_TRANSLATIONS[text]
  if (ui) return ui[index]
  if (CHARACTER_NAMES[text]) return CHARACTER_NAMES[text][index]
  if (STAT_NAMES[text]) return STAT_NAMES[text][index]
  const inventoryTerm = localizeInventoryTerm(text, 'trait', normalizedLanguage)
  if (inventoryTerm !== text) return inventoryTerm
  const sigilTerm = localizeInventoryTerm(text, 'sigil', normalizedLanguage)
  if (sigilTerm !== text) return sigilTerm
  const wrightstoneTerm = localizeInventoryTerm(text, 'wrightstone', normalizedLanguage)
  if (wrightstoneTerm !== text) return wrightstoneTerm
  const genericTerm = GENERIC_TERMS[text]
  if (genericTerm) return genericTerm[index]
  if (text.endsWith(' *')) {
    const label = localizeText(text.slice(0, -2), normalizedLanguage)
    if (label !== text.slice(0, -2)) return `${label} *`
  }
  return translateDynamicText(text, normalizedLanguage)
}

export function localizeDOM(root, language) {
  const normalizedLanguage = normalizeLanguage(language)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    const value = node.nodeValue ?? ''
    const content = value.trim()
    if (content) {
      const start = value.match(/^\s*/)?.[0] ?? ''
      const end = value.match(/\s*$/)?.[0] ?? ''
      node.nodeValue = `${start}${localizeText(content, normalizedLanguage)}${end}`
    }
    node = walker.nextNode()
  }

  for (const element of root.querySelectorAll('*')) {
    for (const attribute of ['aria-label', 'placeholder', 'title', 'label']) {
      const value = element.getAttribute(attribute)
      if (value) element.setAttribute(attribute, localizeText(value, normalizedLanguage))
    }
  }

  const languageOption = LANGUAGE_OPTIONS.find(({ value }) => value === normalizedLanguage)
  if (languageOption) document.documentElement.lang = languageOption.htmlLang
}
