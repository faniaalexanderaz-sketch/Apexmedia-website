# -*- coding: utf-8 -*-
import icons as I

STRINGS = {
    "title": "Apex Media — 东方精华 · 六个月报告与增长计划",
    "tag": "Performance Marketing Agency",
    "foot_l": "Apex Media · 东方精华 · 半年度报告",
    "foot_r": "2026 年 9 月",
}

def chip(ic, cls, label):
    return f'<div class="chip"><span class="ico {cls}">{ic}</span><span class="lb">{label}</span></div>'

def row(ic, cls, title, body, extra=""):
    return (f'<div class="row"><span class="ico {cls}">{ic}</span><div class="bd">'
            f'<h3>{title}</h3><p>{body}</p>{extra}</div></div>')

def numbox(n, title, body, arrow="", cls=""):
    a = f'<div class="arrowline">&rarr; {arrow}</div>' if arrow else ''
    return (f'<div class="card" style="margin-bottom:4mm"><div class="numbox">'
            f'<span class="nb {cls}">{n}</span><div style="flex:1">'
            f'<h3>{title}</h3><p style="font-size:8.9pt;margin-bottom:0">{body}</p>'
            f'{a}</div></div></div>')

def kpi(v, k, d="", vcls=""):
    dd = f'<div class="d">{d}</div>' if d else ""
    return f'<div class="card kpi"><div class="v {vcls}">{v}</div><div class="k">{k}</div>{dd}</div>'

PAGES = []

# ---------------------------------------------------------------- 1 · 封面
PAGES.append({"cls": "cover", "body": f"""
  <div class="hero">
    <div class="eyebrow">半年度报告 &amp; 增长计划</div>
    <div class="kicker">东方精华 · 养生中心 · 亚历山德里亚</div>
    <h1>六个月的工作、<br/>一个真正有效的渠道，<br/>以及把它放大的计划</h1>
    <div class="rule"></div>
    <p class="lead">本文件包含两个部分。<strong>第一部分</strong>梳理过去六个月的工作：
    从三月至今的逐月增长、每个渠道带来的真实客户数 —— 谷歌、Instagram、Facebook、TikTok、Treatwell ——
    以及它们<strong>实际带来了多少营业额</strong>。
    <strong>第二部分</strong>说明从九月和十月开始有哪些变化，以及我们已经准备好的、
    用来放大成果的具体行动。所有数字都来自真实联系记录 —— 来电、WhatsApp 消息和已完成的预约 ——
    绝不使用「点赞」或「播放量」。</p>
    <div class="chips">
      {chip(I.GOOGLE,'i-google','Google')}
      {chip(I.IG,'i-ig','Instagram')}
      {chip(I.FB,'i-fb','Facebook')}
      {chip(I.TT,'i-tt','TikTok')}
      {chip(I.TW,'i-tw','Treatwell')}
      {chip(I.WA,'i-wa','WhatsApp')}
    </div>
    <div class="meta">
      <div><dt>客户</dt><dd>东方精华 · 养生中心</dd></div>
      <div><dt>负责人</dt><dd>Alexander Fania &amp; Federico Delfino</dd></div>
      <div><dt>分析周期</dt><dd>2026 年 3 月 – 8 月（六个月）</dd></div>
      <div><dt>执行计划</dt><dd>2026 年 9 月 – 10 月</dd></div>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 2 · 概要
PAGES.append({"body": f"""
  <div class="eyebrow">01 — 概要</div>
  <h2>六个月，四个关键数字</h2>
  <div class="rule"></div>
  <p class="lead">这六个月最重要的成果不是粉丝数，而是：今天已经存在一个每天都能带来真实客户、
  并且可以被准确衡量的渠道。六个月前，它并不存在。</p>
  <div class="g4" style="margin:6mm 0 5mm">
    {kpi("61","上个月的客户总数","电话、WhatsApp、Treatwell","vio")}
    {kpi("55","来自谷歌的客户","支撑全局的渠道")}
    {kpi("&gt;90%","谷歌客户占比","在所有活跃渠道中")}
    {kpi("5,0&#9733;","谷歌口碑评分","106 条真实评价")}
  </div>
  <div class="note vio">
    <h4>这些数字该怎么看</h4>
    <p style="margin-bottom:0">我们只统计<strong>真实且可核实的联系</strong>：一通电话、一条 WhatsApp 消息、
    一笔完成的 Treatwell 预约。我们不统计播放量、覆盖人数或「点赞」，因为它们付不了房租。
    八月的数字 —— <strong>2026 年 7 月 27 日至 8 月 27 日期间约 61 位客户</strong> ——
    是整套系统（网站 + 数据追踪 + 谷歌广告）首次全面运转的第一个月。</p>
  </div>
  <hr class="hr"/>
  <div class="eyebrow">现状对比</div>
  <h2>六个月里改变了什么</h2>
  <div class="rule"></div>
  <div class="g2">
    <div class="card quiet">
      <h4>2026 年 3 月 — 起点</h4>
      <ul class="ticks grey">
        <li>没有能带来转化的网站，没有单项理疗的专属页面</li>
        <li>没有数据追踪，无法知道客户从哪里来</li>
        <li>谷歌上没有任何广告投放</li>
        <li>预约完全依赖口碑和路过的客人</li>
        <li>社交账号存在，但没有清晰的预约引导</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">2026 年 8 月 — 今天的位置</h4>
      <ul class="ticks">
        <li><strong>完整网站</strong>，8 个专属页面，每项理疗各一个</li>
        <li><strong>数据追踪已启用</strong>（Google Analytics + Google Ads）：每位客户都有来源</li>
        <li><strong>谷歌广告已运行</strong>，6 个本地意图广告组</li>
        <li><strong>Treatwell 预约系统</strong>已直接集成到网站中</li>
        <li><strong>每月 55 位来自谷歌的客户</strong>，是实测数据，不是估算</li>
      </ul>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 3 · 六个月
PAGES.append({"body": f"""
  <div class="eyebrow">02 — 六个月历程</div>
  <h2>我们是如何做到每月 61 位客户的</h2>
  <div class="rule"></div>
  <p class="lead">一个能带来客户的广告系统，不可能在第一天就见效。前期要搭建结构，然后启动引擎，
  再进行测量和修正。这六个月，正好就是这三个阶段。</p>
  <div class="tl" style="margin-top:7mm">
    <div class="it done">
      <div class="w">第一阶段 · 2026 年 3–6 月 · 搭建</div>
      <h3>先建好一个值得投放广告的基础</h3>
      <p style="font-size:9pt">重做网站，为八项理疗各建一个专属页面 —— 足底反射疗法、推拿指压、刮痧、
      精油按摩、水疗按摩、修脚、采耳、拔罐。价格公开、每天 9:30–22:30 营业时间清晰、
      电话与 WhatsApp 触手可及、Treatwell 预约系统直接嵌入。
      如果没有这些页面，每一欧元广告费都会落在一个笼统的首页上：花钱买来点击，却换不到预约。</p>
    </div>
    <div class="it done">
      <div class="w">第二阶段 · 2026 年 7 月 · 测量与启动</div>
      <h3>装好测量工具，启动谷歌广告</h3>
      <p style="font-size:9pt">在所有页面安装谷歌代码与谷歌广告转化跟踪：从这一刻起，
      每一通来电、每一条 WhatsApp、每一次打开 Treatwell 预约窗口都成为可分析的数据。
      <strong>7 月 27 日，谷歌广告正式上线</strong>：六个广告组，每项理疗一组，
      每组都指向它自己的页面，而不是首页。从此不再靠猜。</p>
    </div>
    <div class="it done">
      <div class="w">第三阶段 · 2026 年 8 月 · 第一个完整月</div>
      <h3>整套系统全面运转的第一个月</h3>
      <p style="font-size:9pt">在 7 月 27 日至 8 月 27 日期间，广告带来<strong>约 55 位可核实的客户</strong>，
      Instagram 在零广告投入的情况下带来 4 位，Facebook 带来 1–2 位，TikTok 为零。
      合计<strong>约 61 位客户</strong>。这是数据第一次真正存在，而且结果是好的 ——
      更何况这是八月，一年中最淡的月份。</p>
    </div>
    <div class="it next">
      <div class="w">第四阶段 · 2026 年 9–10 月 · 放大</div>
      <h3>把已经验证有效的部分放大</h3>
      <p style="font-size:9pt">最难的部分 —— 搭建结构、安装测量、找到真正有效的渠道 —— 已经完成。
      接下来是真正产生回报的部分：在回报已被验证的地方加大投入，从没有回报的地方撤出资源。
      完整计划见本文件第二部分。</p>
    </div>
  </div>
  <div class="note amber" style="margin-top:6mm">
    <h4>前几个月的数字是如何还原的</h4>
    <p style="margin-bottom:0">自动追踪是 7 月才安装的：因此本文件中 3 月至 6 月的数字，
    是依据预约簿、来电记录和已登记预约所做的<strong>还原估算</strong>，而不是系统自动测量的结果，
    我们如实标注。八月的数据则是由系统逐条测量的 ——
    这也正是前几个月最重要的成果：今天，东方精华知道自己的客户从哪里来。以前不知道。</p>
  </div>
"""})

# ---------------------------------------------------------------- 4 · 渠道
PAGES.append({"body": f"""
  <div class="eyebrow">04 — 渠道</div>
  <h2>客户到底从哪里来</h2>
  <div class="rule"></div>
  <p class="lead">按渠道拆分的实测月度真实客户数（2026 年 7 月 27 日 – 8 月 27 日）。
  九月和十月的全部策略，都建立在这张图上。</p>
  <table style="margin:6mm 0 5mm">
    <thead><tr>
      <th style="width:34%">渠道</th><th class="n">客户数</th>
      <th style="width:26%">占比可视化</th><th class="n">占比</th><th class="n">广告投入</th>
    </tr></thead>
    <tbody>
      <tr><td class="ch">谷歌（自然搜索 + 广告）</td><td class="n"><strong>55</strong></td>
          <td><span class="bar"><i class="gold" style="width:100%"></i></span></td><td class="n">90%</td><td class="n">有</td></tr>
      <tr><td class="ch">Instagram（纯自然流量）</td><td class="n"><strong>4</strong></td>
          <td><span class="bar"><i style="width:7.3%"></i></span></td><td class="n">7%</td><td class="n">€0</td></tr>
      <tr><td class="ch">Facebook（估算）</td><td class="n">1–2</td>
          <td><span class="bar"><i class="grey" style="width:2.7%"></i></span></td><td class="n">2–3%</td><td class="n">€0</td></tr>
      <tr><td class="ch">TikTok</td><td class="n">0</td>
          <td><span class="bar"><i class="grey" style="width:0"></i></span></td><td class="n">0%</td><td class="n">€0</td></tr>
    </tbody>
    <tfoot><tr><td>本月客户合计</td><td class="n">约 61</td><td></td><td class="n">100%</td><td class="n"></td></tr></tfoot>
  </table>
  {row(I.GOOGLE,'i-google','谷歌 — 55 位客户 · 支撑全局的渠道',
     '7 月 27 日上线的广告，一个月内带来约 55 位可核实的客户。这是目前唯一每天持续产出结果的渠道，也是唯一能把每一欧元投入一路追踪到预约的渠道。',
     '<div class="legend"><span><i style="background:linear-gradient(135deg,#E7C568,#C99C2E)"></i>谷歌广告（Ads）— 约 35–40 位</span><span><i style="background:linear-gradient(135deg,#5B35E8,#1E4FD8)"></i>谷歌自然搜索 — 约 15–20 位</span></div>')}
  {row(I.IG,'i-ig','Instagram — 4 位客户 · 零成本',
     '全部来自已发布的内容，没有投入一欧元广告费。绝对数量不多，但这是本月最值得注意的信号：说明受众是存在的，缺的只是发布的数量和稳定的节奏。')}
  {row(I.FB,'i-fb','Facebook — 1–2 位客户 · 估算，非确定数据',
     '带来的客户极少。必须说清楚：Facebook 的后台数据无法可靠读取，因此 1–2 是估算值而非确定数字。可以确定的是，这个渠道的贡献非常有限。')}
  {row(I.TT,'i-tt','TikTok — 0 位客户',
     '在分析周期内，该渠道没有带来任何客户。花在这里的时间，是从 Instagram 和谷歌那里挪走的时间 —— 而客户恰恰来自后两者。')}
"""})

# ---------------------------------------------------------------- 5 · 预约方式
PAGES.append({"body": f"""
  <div class="eyebrow">06 — 预约方式</div>
  <h2>客户实际是怎么预约的</h2>
  <div class="rule"></div>
  <p class="lead">在谷歌上看到广告、或在 Instagram 上看到内容之后，客户会通过三种方式之一完成预约。
  知道哪一种最重要，并不是细节问题：它决定了按钮放在哪里、广告文案怎么写、哪些时段必须有人值守。</p>
  <div style="margin-top:7mm">
  {row(I.TEL,'i-tel','电话来电 — 第一预约渠道',
     '带来客户最多的方式，尤其是通过谷歌搜索或谷歌广告找到中心的人。晚上 18:30 搜索「亚历山德里亚 按摩」的人，想的是现在就约：他们会直接打电话。')}
  {row(I.TW,'i-tw','Treatwell 预约 — 夜间也在工作的渠道',
     '客户直接在网站上通过 Treatwell 完成预约，无需打电话。它与电话并列为最稳固的客户来源，并且有一个决定性优势：中心关门时、或双手正在为客人服务时，它照常工作。')}
  {row(I.WA,'i-wa','WhatsApp 消息 — 犹豫者的渠道',
     '客户直接发消息联系，通常发生在看过 Instagram 内容之后。会发 WhatsApp 的人，一般是在预约前还有问题要问：这里的回复速度，价值不亚于价格。')}
  </div>
  <hr class="hr"/>
  <div class="note">
    <h4>为什么这一点比看上去更重要</h4>
    <p style="margin-bottom:0">三种预约方式，意味着三扇开着的门。如果其中一扇关上了 ——
    电话占线、消息发来时中心已打烊 —— 客户会走另一扇门，而不是转身去竞争对手那里。
    接下来两个月，我们会在这三条路上<strong>同时降低摩擦</strong>：
    非营业时间的 WhatsApp 自动回复、手机端始终可见的预约按钮，
    以及只在有人接听的时段启用的谷歌广告一键拨号。</p>
  </div>
"""})

# ---------------------------------------------------------------- 6 · 资产
PAGES.append({"body": f"""
  <div class="eyebrow">07 — 已建成的资产</div>
  <h2>东方精华今天拥有、而六个月前没有的东西</h2>
  <div class="rule"></div>
  <p class="lead">广告投放可以一键关停；但围绕它建起来的东西会留下来，并且每天都在工作。
  这是真实的资产清单。</p>
  <div class="g2" style="margin-top:6mm">
    {row(I.SITE,'i-ig','一个为预约而建、而不是为了好看的网站',
       '八个专属页面，每项理疗一个，每个页面都有公开价格、真实照片和预约按钮。每条广告都指向正确的页面：正是这种一致性，把一次点击变成一次预约。')}
    {row(I.CHART,'i-tel','一套此前并不存在的测量系统',
       'Google Analytics 与谷歌广告转化跟踪已安装在所有页面上。今天可以知道有多少人打电话、多少人发消息、多少人打开 Treatwell —— 以及他们来自哪一条广告。')}
    {row(I.TARGET,'i-google','一套结构完整、已完成优化的谷歌广告账户',
       '六个本地意图广告组，关键词已清理掉浪费预算的词，地理定向覆盖亚历山德里亚及周边城镇，附加信息、附加链接与广告文案均已经过一个月的实测。')}
    {row(I.STAR,'i-tw','一份比广告更值钱的线上口碑',
       '谷歌 5,0 星，106 条真实评价。正是这项资产让客户在同样投放广告的商家中选择东方精华：任何本地竞争对手都无法在两个月内买到它。')}
  </div>
  <hr class="hr tight"/>
  <div class="note amber">
    <h4>这里值得停下来想一想</h4>
    <p>这四项资产花了六个月时间，属于整个流程中「慢」的部分。网站只需建一次，
    追踪只需装一次，评价需要数年累积，广告账户需要数周的搭建与修正才能给出稳定数据。</p>
    <p style="margin-bottom:0"><strong>这一切都已经完成，也已经付过钱了。</strong>
    接下来要做的 —— 在有效的地方加大预算、发布更多内容、经营 Treatwell ——
    是「快」的部分，是真正产生倍增的部分。此时停下，等于为慢的部分付了钱，
    却把赚钱的部分让给了别人。</p>
  </div>
"""})

# ---------------------------------------------------------------- 7 · 第二部分
PAGES.append({"cls": "part", "body": f"""
  <div class="wrap">
  <div class="big">02</div>
  <div class="eyebrow">第二部分</div>
  <h1>九月与十月的执行计划</h1>
  <div class="rule"></div>
  <p class="lead" style="max-width:140mm">从现在起，逐个渠道说明：在哪里加大投入、关停什么、
  有哪些新动作上线、以及我们用哪些数字来判断它是否有效。不讲空话：只有带日期、可核实的行动。</p>
  <div style="display:flex;gap:4mm;margin-top:8mm;flex-wrap:wrap">
    <span class="pill vio">谷歌广告加码</span>
    <span class="pill new">新增 · 再营销</span>
    <span class="pill vio">Instagram 内容计划</span>
    <span class="pill new">新增 · Treatwell 页面优化</span>
    <span class="pill vio">网站：提升预约率</span>
    <span class="pill new">新增 · 老客唤回</span>
    <span class="pill gold">谷歌商家资料运营</span>
  </div>
  </div>
"""})

# ---------------------------------------------------------------- 8 · 时机
PAGES.append({"body": f"""
  <div class="eyebrow">08 — 时机</div>
  <h2>为什么现在是最不该停下来的时候</h2>
  <div class="rule"></div>
  <p class="lead">这不是信任问题，而是时间问题。三个可衡量的事实说明：
  接下来这两个月，比刚刚过去的六个月更有价值。</p>
  {numbox('01','广告才运行了一个月，就已经带来 55 位客户',
    '谷歌广告依靠数据自我优化：记录的转化越多，就越清楚该在什么时间、向谁展示广告。八月这 55 位客户，是一个仍处在学习期、预算极低的广告系统做到的。现在关停，等于把让它今后更高效的那一个月数据全部丢掉 —— 而重新开始，会再一次付出时间和金钱。')}
  {numbox('02','被测量的这个月是八月，也就是一年中最差的一个月',
    '八月是关门、休假、城市空荡的月份。那 61 位客户，是在最不利的环境里做出来的。从九月开始，按摩、足底反射疗法和背部理疗的需求会结构性回升：返工、复工、降温、肌肉紧张。同样的投入，在正常月份回报更高。')}
  {numbox('03','九月到十二月，是决定全年的时期',
    '对养生中心来说，秋季和圣诞是绝对的高峰期：缓解返工压力的理疗、礼品与礼品卡、套餐。带着一套已经磨合好的广告系统和一个被认真运营的谷歌商家资料进入十一月，是从十一月才起步所无法追回的优势。')}
  <hr class="hr tight"/>
  <div class="g2">
    <div class="card quiet">
      <h4>如果今天全部停掉</h4>
      <ul class="ticks grey">
        <li>广告停止：每月 55 位谷歌客户会在 24 小时内消失</li>
        <li>只剩自然搜索客户：约 15–20 位，而不是 55 位</li>
        <li>广告系统已积累的一个月数据全部作废</li>
        <li>仍在投放的竞争对手，会接手这些搜索需求</li>
        <li>半年后重启，意味着学习期要从头再走一遍</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">如果继续做完这两个月</h4>
      <ul class="ticks">
        <li>广告进入成本更低、转化更高的阶段</li>
        <li>从 Facebook 和 TikTok 撤下的预算，投向已验证有效的地方</li>
        <li>Instagram 从「4 位免费客户」变成一个有真正计划的渠道</li>
        <li>带着一台已经预热好的机器进入旺季</li>
        <li>十二月做决定时，手里握的是<em>数据</em>，而不是感觉</li>
      </ul>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 9 · 谷歌
PAGES.append({"body": f"""
  <div class="eyebrow">09 — 新动作 · 谷歌</div>
  <h2>放大那个已经有效的渠道</h2>
  <div class="rule"></div>
  <p class="lead">谷歌带来超过 90% 的客户。效果营销只有一条规则：
  在回报已被测量的地方加大投入。以下是九月起上线的内容。</p>
  <div style="margin-top:6mm">
  {row(I.TARGET,'i-google','为带来来电的广告增加预算 <span class="pill new" style="margin-left:2mm">优先级 1</span>',
     '不是平均撒钱：只对第一个月真正产生来电和预约的广告组加大投入 —— 足底反射疗法、推拿指压和舒缓肌肉的按摩。表现不佳的广告组是缩减而非删除，并用新文案重新测试。')}
  {row(I.CHART,'i-tel','出价策略切换为「转化次数最大化」 <span class="pill new" style="margin-left:2mm">新增</span>',
     '第一个月，广告的目标是以最低成本获得点击。现在转化数据已经足够，它将改为以带来<strong>预约</strong>为目标，而不是带来访问。这通常是最能压低单位获客成本的一步。')}
  {row(I.TEL,'i-ig','在有人值守的时段启用一键拨号 <span class="pill new" style="margin-left:2mm">新增</span>',
     '把「拨打电话」按钮直接放进广告里，并且只在有人接听的时段开启。晚上找按摩的人，三十秒内就会做决定：我们去掉「先进网站」这一步，让他直接打过来。')}
  {row(I.STAR,'i-tw','每条广告都带上价格与评价 <span class="pill new" style="margin-left:2mm">新增</span>',
     '把四项主力理疗的真实价格，连同 5,0&#9733; 与 106 条评价，直接展示在广告中。这能减少那些「只是看看」、花钱却不预约的点击，同时提高到店联系的质量。')}
  {row(I.MAPS,'i-fb','再营销：把没有预约的人重新带回来 <span class="pill new" style="margin-left:2mm">新增</span>',
     '访问过网站、看过价格却没有当场预约的人，是成本最低的可回收客户。十月起启动一个小规模再营销广告，在随后几天用他当时正在看的那项理疗和一个明确的优惠把他带回来。')}
  </div>
  <div class="note amber" style="margin-top:5mm">
    <h4>那么 Facebook 和 TikTok 呢？</h4>
    <p style="margin-bottom:0"><strong>Facebook 不关停，而是换一个角色。</strong>
    我们停止在它上面投放冷启动广告（已经证明无效），转而用它做真正有效的事 ——
    承接 Meta 再营销，以及转发 Instagram 的内容。
    十月以后该渠道的预期增长，正是来自这里。
    <strong>TikTok 则需要暂停</strong>，下一页会具体说明原因，以及在什么条件下值得重新打开。</p>
  </div>
"""})

# ---------------------------------------------------------------- 10 · 内容与 Treatwell
PAGES.append({"body": f"""
  <div class="eyebrow">10 — 新动作 · 内容与 Treatwell</div>
  <h2>把 4 位免费客户，变成一个真正的渠道</h2>
  <div class="rule"></div>
  <p class="lead">Instagram 在没有一欧元广告、也没有任何计划的情况下带来了 4 位客户。
  这是整份报告中最被低估的数据：一个在最低状态下就已经有效的渠道，却从来没有被认真规划过。</p>
  <div style="margin-top:6mm">
  {row(I.IG,'i-ig','围绕需求最高的理疗制定内容排期 <span class="pill new" style="margin-left:2mm">新增</span>',
     '从九月起按排期发布，而不是凭感觉：内容围绕在谷歌上搜索量最高的理疗来做 —— 足底反射疗法、推拿指压、深层放松按摩 —— 因为我们已经知道本地的人在搜什么。')}
  {row(I.WA,'i-wa','每一条内容都带一个清晰的预约引导 <span class="pill new" style="margin-left:2mm">新增</span>',
     '每条帖子、每个快拍都以唯一一个动作收尾：打电话、发 WhatsApp，或在 Treatwell 上预约。没有预约引导的内容是娱乐，不是营销。')}
  {row(I.TW,'i-tw','Treatwell 页面的完整优化 <span class="pill new" style="margin-left:2mm">新增</span>',
     'Treatwell 不只是网站上的一个预约窗口，它本身就是一个客户用来搜索本地养生中心的平台。我们会重做照片、理疗描述、时长与价格，并对空档较多的时段启用优惠，把工作日的空闲时间填满。')}
  {row(I.MAPS,'i-google','每周运营谷歌商家资料 <span class="pill new" style="margin-left:2mm">新增</span>',
     '每周发布动态、更新照片、回复全部评价、补全问答栏目。这项工作是免费的，却直接影响本地搜索排名和导航请求量 —— 而它恰恰是目前最被闲置的一根杠杆。')}
  {row(I.TT,'i-tt','TikTok：这是有意识的暂停，不是放弃 <span class="pill" style="margin-left:2mm">暂停中</span>',
     '一个月零客户不是偶然，而是内容形式不对。下一页会具体说明，要真正重新启动它需要什么。')}
  </div>
"""})

# ---------------------------------------------------------------- 11 · 老客户
PAGES.append({"body": f"""
  <div class="eyebrow">12 — 新动作 · 让客户再回来</div>
  <h2>最赚钱的客户，是已经来过一次的那位</h2>
  <div class="rule"></div>
  <p class="lead">到目前为止，所有工作都用在把新客带进门。从十月起，我们同时启动相反的一侧 ——
  也是几乎没有人认真做的一侧：让来过的人再回来。成本几乎为零，价值却极高。</p>
  <div class="g3" style="margin:6mm 0 5mm">
    {kpi("约 61","每月新客户","来自广告与自然流量","vio")}
    {kpi("第二次","最经济的杠杆","无需任何广告成本")}
    {kpi("秋季","高峰季节","压力、降温、肌肉紧张")}
  </div>
  {numbox('01','30 天唤回消息','来过一次、之后没有再来的客户，会收到一条简单、非广告式的 WhatsApp 消息：提醒他上次做过的理疗，并让他两下点击就能重新预约。单次触达成本：零。','不花广告费就能填满空闲时段')}
  {numbox('02','为圣诞季准备套餐与礼品卡','从十一月中旬开始，礼品卡是任何养生中心最畅销的产品。我们现在就准备好专属页面、文案、视觉素材和推广，这样到了十二月是在卖货，而不是临时凑合。','多出一个高毛利的第二产品线')}
  {numbox('03','针对弱时段的限时优惠','工作日上午的时段最难填满。一个只针对这些时段、在 Treatwell 和 Instagram 上推广的专属优惠，能把空闲时间变成营业额，同时不必下调正价。','固定成本不变，营业额提高')}
  <div class="note" style="margin-top:2mm">
    <p style="margin-bottom:0" class="small"><strong>为什么现在就要谈这件事：</strong>
    这三个动作不需要额外的广告预算，但需要时间来准备。九月和十月开始做，十二月就已经就绪并开始产生销售；
    十二月才开始做，就已经太迟了。</p>
  </div>
"""})

# ---------------------------------------------------------------- 12 · 路线图
PAGES.append({"body": f"""
  <div class="eyebrow">13 — 路线图</div>
  <h2>接下来八周，逐周安排</h2>
  <div class="rule"></div>
  <p class="lead">没有笼统的动作。每一周都有明确的执行内容和可核实的结果，
  这样到十月底，这份工作可以完全按事实来评判。</p>
  <div class="tl" style="margin-top:7mm">
    <div class="it next"><div class="w">第 1–2 周 · 九月下旬</div>
      <h3>预算迁移，切换为「转化次数最大化」</h3>
      <p style="font-size:8.9pt">把预算从 Facebook 和 TikTok 撤出，重新分配到表现良好的谷歌广告组。
      启用一键拨号与价格附加信息。首次复盘那些花了钱却没有转化的关键词。</p></div>
    <div class="it next"><div class="w">第 3–4 周 · 十月上旬</div>
      <h3>Treatwell 页面与谷歌商家资料</h3>
      <p style="font-size:8.9pt">全面重写 Treatwell 上的理疗描述，更换新照片，
      对弱时段启用优惠。启动谷歌商家资料的每周动态发布，并回复全部评价。</p></div>
    <div class="it next"><div class="w">第 5–6 周 · 十月中旬</div>
      <h3>Instagram 内容计划全面运行，再营销上线</h3>
      <p style="font-size:8.9pt">围绕搜索量最高的理疗执行内容排期，每条内容都带预约引导。
      面向访问过网站但未预约的人，启动再营销广告。</p></div>
    <div class="it next"><div class="w">第 7–8 周 · 十月下旬</div>
      <h3>老客唤回与圣诞季准备</h3>
      <p style="font-size:8.9pt">向超过 30 天未再光顾的客户发出第一批唤回消息。
      准备好礼品卡页面与圣诞套餐，确保十一月第一周即可上线。</p></div>
  </div>
  <div class="note vio" style="margin-top:6mm">
    <h4>十月底的那份报告</h4>
    <p style="margin-bottom:0">十月底，我们会交付一份与本文件完全相同格式的报告，
    包含这两个月的真实数据：分渠道客户数、单位获客成本，以及与八月 61 位客户的直接对比。
    <strong>如果数字没有改善，我们会白纸黑字写出来</strong> ——
    就像我们写明了 TikTok 带来零客户、Facebook 的数据不可靠一样。</p>
  </div>
"""})

# ---------------------------------------------------------------- 13 · 预测
PAGES.append({"body": f"""
  <div class="eyebrow">14 — 目标</div>
  <h2>六个月后可以到达的位置</h2>
  <div class="rule"></div>
  <p class="lead">本预测基于八月的真实数据和本计划中的各项行动：<strong>谷歌</strong>依靠加大预算与
  优化，每月增长 15%；<strong>Instagram</strong> 从十月起随内容计划全面运行而加速；
  <strong>Facebook</strong> 从十月起以新角色重启 —— 承接 Meta 再营销与转发内容，
  而不再是冷启动广告；<strong>TikTok</strong> 保持暂停，直到满足第 11 节所述的条件。</p>
  <table style="margin:5mm 0 4mm">
    <thead><tr>
      <th>月份</th><th class="n">谷歌</th><th class="n">Instagram</th>
      <th class="n">Facebook</th><th class="n">TikTok</th><th class="n">合计</th><th style="width:16%">趋势</th>
    </tr></thead>
    <tbody>
      <tr><td class="ch">2026 年 8 月 <span class="pill gold" style="margin-left:2mm">真实数据</span></td>
          <td class="n">55</td><td class="n">4</td><td class="n">1–2</td><td class="n">0</td>
          <td class="n"><strong>约 61</strong></td>
          <td><span class="bar"><i class="gold" style="width:38%"></i></span></td></tr>
      <tr><td class="ch">2026 年 9 月</td><td class="n">63</td><td class="n">5</td><td class="n">2</td>
          <td class="n">暂停</td><td class="n"><strong>约 70</strong></td>
          <td><span class="bar"><i style="width:43%"></i></span></td></tr>
      <tr><td class="ch">2026 年 10 月</td><td class="n">73</td><td class="n">8</td><td class="n">6</td>
          <td class="n">暂停</td><td class="n"><strong>约 87</strong></td>
          <td><span class="bar"><i style="width:54%"></i></span></td></tr>
      <tr><td class="ch">2026 年 11 月</td><td class="n">84</td><td class="n">11</td><td class="n">8</td>
          <td class="n">暂停</td><td class="n"><strong>约 103</strong></td>
          <td><span class="bar"><i style="width:64%"></i></span></td></tr>
      <tr><td class="ch">2026 年 12 月</td><td class="n">96</td><td class="n">14</td><td class="n">10</td>
          <td class="n">暂停</td><td class="n"><strong>约 120</strong></td>
          <td><span class="bar"><i style="width:74%"></i></span></td></tr>
      <tr><td class="ch">2027 年 1 月</td><td class="n">111</td><td class="n">17</td><td class="n">12</td>
          <td class="n">暂停</td><td class="n"><strong>约 140</strong></td>
          <td><span class="bar"><i style="width:86%"></i></span></td></tr>
      <tr><td class="ch">2027 年 2 月</td><td class="n">127</td><td class="n">21</td><td class="n">14</td>
          <td class="n">暂停</td><td class="n"><strong>约 162</strong></td>
          <td><span class="bar"><i style="width:100%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="g3 compact" style="margin:4mm 0">
    {kpi("+166%","8 月 → 次年 2 月客户增长","从约 61 增至约 162 位/月","vio")}
    {kpi("约 &euro;2.800","次年 2 月可追踪营业额","八月为约 &euro;1.065")}
    {kpi("&lt; &euro;18","单位获客成本目标","针对谷歌广告")}
  </div>
  <div class="note amber">
    <h4>必须说清楚的一点</h4>
    <p style="margin-bottom:0">这是一份<strong>预测，不是承诺</strong>。
    它的起点是真实数据（八月谷歌带来 55 位客户、可追踪营业额约 &euro;1.065），
    增长假设已公开写明、可逐月核实。营业额估算采用八月记录的客户平均价值，且偏保守，
    因为它只覆盖经过 Treatwell 的部分以及谷歌和 Instagram 的估算。
    如果某个月没有实现增长，我们会写进报告并更换策略杠杆 —— 就像我们对 TikTok 所做的那样。</p>
  </div>
"""})

# ---------------------------------------------------------------- 14 · 结语
PAGES.append({"body": f"""
  <div class="eyebrow">结语</div>
  <h2>我们的请求，用一页说完</h2>
  <div class="rule"></div>
  <div class="g3" style="margin:2mm 0 6mm">
    {kpi("6 个月","已完成的工作","网站、数据、广告、口碑","vio")}
    {kpi("1 个月","已测量的广告投放","八月，谷歌带来 55 位客户")}
    {kpi("2 个月","用来放大成果","九月与十月")}
  </div>
  <p class="lead">前六个月用于搭建，也用于弄清楚什么真正有效。答案已经很清楚：
  <strong>谷歌带来超过 90% 的客户，Instagram 有尚未开发的潜力，Facebook 和 TikTok 没有回报</strong>。
  现在我们确切知道每一欧元和每一小时该投向哪里 —— 而这是第一次，我们是拿着数据知道的。</p>
  <p class="lead">此刻停下并不会省钱：会失去让广告更高效的那一个月数据，
  会在二十四小时内失去每月 55 位客户，也会失去养生中心一年中营收最高的那个时期。
  「慢」的部分已经完成，也已经付过钱了。剩下的，正是产生倍增的那部分。</p>
  <div class="cta" style="margin-top:6mm">
    <h3 style="font-size:12pt;margin-bottom:3mm">我们的具体提议</h3>
    <ul class="ticks" style="font-size:9.2pt">
      <li><strong>九月和十月，两个月的验证期</strong>，完整执行本文件所描述的全部计划。</li>
      <li><strong>十月底交付一份与本文件相同的报告</strong>：分渠道真实客户数、单位获客成本，以及与八月的直接对比。</li>
      <li><strong>十一月根据数字做决定</strong>，而不是根据感觉。如果结果没有出现，我们会像在这里写明 TikTok 的结果一样，如实写出来。</li>
    </ul>
  </div>
  <p class="small" style="margin-top:6mm">关于本文件、其中的数字或整个计划，
  如有任何问题，我们随时可以一起逐条重新过一遍，也可以当面沟通。</p>
  <div class="sign">
    <div class="n">Alexander Fania &amp; Federico Delfino</div>
    <div class="s">Apex Media · Performance Marketing Agency</div>
    <div class="s">本文件为东方精华 · 养生中心（亚历山德里亚）编制</div>
  </div>
"""})

# ================================================================
# 修订 —— 历史增长、可追踪营业额、TikTok 暂停
# ================================================================

PAGE_CRESCITA = {"body": f"""
  <div class="eyebrow">03 — 增长</div>
  <h2>从每月 13 位客户，到 61 位</h2>
  <div class="rule"></div>
  <p class="lead">六个月的完整曲线，按渠道拆分。其中有两次不同性质的跃升：
  第一次从三月到七月，来自网站和理疗专属页面；第二次在八月，来自谷歌广告。</p>
  <table style="margin:6mm 0 4mm">
    <thead><tr>
      <th>月份</th><th class="n">谷歌</th><th class="n">Instagram</th><th class="n">Facebook</th>
      <th class="n">TikTok</th><th class="n">合计</th><th style="width:18%">趋势</th>
    </tr></thead>
    <tbody>
      <tr><td class="ch">2026 年 3 月</td><td class="n">10</td><td class="n">2</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>13</strong></td>
          <td><span class="bar"><i class="grey" style="width:21%"></i></span></td></tr>
      <tr><td class="ch">2026 年 4 月</td><td class="n">13</td><td class="n">2</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>16</strong></td>
          <td><span class="bar"><i class="grey" style="width:26%"></i></span></td></tr>
      <tr><td class="ch">2026 年 5 月</td><td class="n">17</td><td class="n">2</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>20</strong></td>
          <td><span class="bar"><i class="grey" style="width:33%"></i></span></td></tr>
      <tr><td class="ch">2026 年 6 月</td><td class="n">21</td><td class="n">3</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>25</strong></td>
          <td><span class="bar"><i class="grey" style="width:41%"></i></span></td></tr>
      <tr><td class="ch">2026 年 7 月</td><td class="n">28</td><td class="n">3</td><td class="n">1</td>
          <td class="n">0</td><td class="n"><strong>32</strong></td>
          <td><span class="bar"><i class="grey" style="width:52%"></i></span></td></tr>
      <tr><td class="ch">2026 年 8 月 <span class="pill gold" style="margin-left:2mm">实测数据</span></td>
          <td class="n">55</td><td class="n">4</td><td class="n">1–2</td>
          <td class="n">0</td><td class="n"><strong>约 61</strong></td>
          <td><span class="bar"><i class="gold" style="width:100%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="g3" style="margin:5mm 0">
    {kpi("+369%","3 月 → 8 月增长","从 13 位增至约 61 位/月","vio")}
    {kpi("×2,5","网站与页面的作用","3 月 → 7 月，无任何广告")}
    {kpi("×1,9","谷歌广告的作用","7 月 → 8 月，仅一个月")}
  </div>
  <div class="note vio">
    <h4>两根杠杆，分开来看</h4>
    <p style="margin-bottom:0">三月到七月没有任何广告投放：客户从 13 位增长到 32 位，
    全部来自重做的网站、八个理疗专属页面和本地搜索排名的提升。
    <strong>随后在 7 月 27 日，谷歌广告上线</strong>：仅一个月，客户数又几乎翻了一倍，
    从 32 位到 61 位。两根杠杆是配合使用的 ——
    这也是为什么关掉第二根，会把数字倒退回几个月前，而不是几周前。</p>
  </div>
"""}

PAGE_FATTURATO = {"body": f"""
  <div class="eyebrow">05 — 可追踪营业额</div>
  <h2>各渠道实际带来了多少营业额</h2>
  <div class="rule"></div>
  <p class="lead">不只是客户数，还有收入。Treatwell 是精确数据，因为它经过预约系统；
  谷歌和 Instagram 是保守估算，因为其中一部分营业额直接进了收银，没有任何系统记录。</p>
  <table style="margin:5mm 0 3mm">
    <thead><tr>
      <th>周期</th><th class="n">Treatwell</th><th class="n">谷歌</th>
      <th class="n">Instagram</th><th class="n">可追踪合计</th><th style="width:15%">趋势</th>
    </tr></thead>
    <tbody>
      <tr><td class="ch">2026 年 7 月</td><td class="n">€290</td><td class="n">约 €150–200</td>
          <td class="n">—</td><td class="n"><strong>约 €470</strong></td>
          <td><span class="bar"><i class="grey" style="width:44%"></i></span></td></tr>
      <tr><td class="ch">2026 年 8 月</td><td class="n"><strong>€585</strong></td><td class="n">约 €420</td>
          <td class="n">约 €60</td><td class="n"><strong>约 €1.065</strong></td>
          <td><span class="bar"><i class="gold" style="width:100%"></i></span></td></tr>
      <tr><td class="ch">2026 年 9 月 1–18 日</td><td class="n">€290</td><td class="n">统计中</td>
          <td class="n">统计中</td><td class="n">本月进行中</td>
          <td><span class="bar"><i style="width:27%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="g3 compact" style="margin:3mm 0 4mm">
    {kpi("+127%","可追踪营业额 7→8 月","从约 €470 到约 €1.065","vio")}
    {kpi("+102%","仅 Treatwell 7→8 月","从 €290 到 €585")}
    {kpi("€41,8","Treatwell 客单价","八月 14 次理疗")}
  </div>
  <div class="g2u">
    <div class="card">
      <h4>八月在 Treatwell 上被预约的项目</h4>
      <table style="margin-top:2mm">
        <tbody>
          <tr><td class="ch">精油按摩</td><td class="n">7</td></tr>
          <tr><td class="ch">水疗按摩</td><td class="n">2</td></tr>
          <tr><td class="ch">足底反射疗法</td><td class="n">2</td></tr>
          <tr><td class="ch">修脚</td><td class="n">2</td></tr>
          <tr><td class="ch">拔罐</td><td class="n">1</td></tr>
        </tbody>
        <tfoot><tr><td>理疗合计 · €585</td><td class="n">14</td></tr></tfoot>
      </table>
    </div>
    <div class="note amber">
      <h4>为什么谷歌没有明细</h4>
      <p>来自谷歌的客户几乎都通过<strong>电话或 WhatsApp</strong> 预约：
      这类预约不经过预约系统，因此具体做了哪个项目没有任何地方记录。</p>
      <p style="margin-bottom:0">八月的约 €420，是根据该渠道带来的联系数量和中心的客单价推算的：
      这是保守估算，真实数值很可能更高，而不是更低。</p>
    </div>
  </div>
  <div class="note" style="margin-top:4mm">
    <h4>那么九月呢？</h4>
    <p style="margin-bottom:0">截至 9 月 18 日，Treatwell 为 <strong>€290</strong>，与七月持平。
    九月本来就是起伏不定的月份，要按它本来的样子来读：刚从假期返回、学费和各类活动开销集中到来、
    工资还没有回到正常节奏。养生消费永远是第一个被推迟的支出。
    <strong>真正关键的月份是十月</strong>：返工完成、开销消化、天气转冷、肌肉紧张。
    那时才能真正衡量这套计划是否有效。</p>
  </div>
"""}

PAGE_TIKTOK = {"body": f"""
  <div class="eyebrow">11 — TikTok</div>
  <h2>为什么要暂停 TikTok（以及重新启动的条件）</h2>
  <div class="rule"></div>
  <p class="lead">一个月零客户不是运气问题，也不是算法问题：是内容形式的问题。
  暂停它是一个技术判断，不是放弃。</p>
  <div class="g2" style="margin-top:5mm">
    <div class="card quiet">
      <h4>今天为什么无效</h4>
      <ul class="ticks grey">
        <li><strong>是没有人出镜的按摩视频。</strong>一双手在背上操作：没有人会看过前两秒</li>
        <li><strong>缺少节奏。</strong>TikTok 奖励快剪和画面变化，节奏慢的视频只会被推给很少的人，然后停止</li>
        <li><strong>镜头前没有人。</strong>TikTok 上有效的是面孔、声音和 POV 视角，而不是理疗床的匿名镜头</li>
        <li><strong>缺少频率。</strong>这个平台需要密集发布才会获得推荐：偶尔发一条，等于没有发</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">重新启动需要什么</h4>
      <ul class="ticks">
        <li><strong>要有一个人愿意持续出镜</strong>：这是前提，没有它其余都没有意义</li>
        <li><strong>POV 形式</strong>：「POV：你带着三周的腰背疼走进我们店里」，从客户视角拍摄</li>
        <li><strong>高节奏</strong>：15–25 秒，每 1–2 秒一个剪辑，大字幕叠加，使用当下热门音频</li>
        <li><strong>每周至少 4–5 条，连续两个月</strong>，否则这个账号不会重新起量</li>
      </ul>
    </div>
  </div>
  <div class="note amber" style="margin-top:4mm">
    <h4>我们的判断，直说</h4>
    <p style="margin-bottom:0">只要还没有人愿意以那样的频率出镜拍摄，
    花在 TikTok 上的每一小时，都是从 Instagram 和谷歌那里挪走的一小时 —— 而客户真正来自后两者。
    <strong>我们现在把它暂停</strong>，等条件具备时再重新打开：
    形式、脚本和剪辑由我们准备，中心负责把人放到镜头前。</p>
  </div>
  <hr class="hr" style="margin:4mm 0"/>
  <div class="g2">
    <div class="note">
      <h4>需要中心配合的部分</h4>
      <ul class="ticks" style="font-size:8.6pt">
        <li>理疗过程的照片和短视频，手机拍摄即可</li>
        <li>客户说「我是在……看到你们的」时，告诉我们</li>
        <li>营业时间内，几小时之内回复 WhatsApp</li>
        <li>每次理疗结束后，都请客户留下谷歌评价</li>
      </ul>
    </div>
    <div class="note vio">
      <h4>由我们负责的部分</h4>
      <ul class="ticks" style="font-size:8.6pt">
        <li>谷歌广告与再营销的全程管理</li>
        <li>每月内容排期，以及可直接发布的现成文案</li>
        <li>Treatwell 页面与谷歌商家资料的优化</li>
        <li>每月一份像这样的、按渠道呈现真实客户的报告</li>
      </ul>
    </div>
  </div>
"""}

PAGES.insert(3, PAGE_CRESCITA)
PAGES.insert(5, PAGE_FATTURATO)
PAGES.insert(12, PAGE_TIKTOK)
