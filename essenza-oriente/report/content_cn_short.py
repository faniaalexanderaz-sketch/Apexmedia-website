# -*- coding: utf-8 -*-
"""八页精简版 —— 内容和数字与长版一致，用词同样简单。"""
import icons as I

STRINGS = {
    "title": "Apex Media — 东方精华 · 八页精简版",
    "tag": "广告与客户增长公司",
    "foot_l": "Apex Media · 东方精华 · 精简版",
    "foot_r": "2026 年 9 月",
}

def chip(ic, cls, label):
    return f'<div class="chip"><span class="ico {cls}">{ic}</span><span class="lb">{label}</span></div>'

def row(ic, cls, title, body):
    return (f'<div class="row"><span class="ico {cls}">{ic}</span><div class="bd">'
            f'<h3>{title}</h3><p>{body}</p></div></div>')

def kpi(v, k, d="", vcls=""):
    dd = f'<div class="d">{d}</div>' if d else ""
    return f'<div class="card kpi"><div class="v {vcls}">{v}</div><div class="k">{k}</div>{dd}</div>'

PAGES = []

# ---------------------------------------------------------------- 1 · 封面
PAGES.append({"cls": "cover", "body": f"""
  <div class="hero">
    <div class="eyebrow">精简版 · 共 8 页</div>
    <div class="kicker">东方精华 · 养生中心 · 亚历山德里亚</div>
    <h1>六个月的工作、<br/>一条真正管用的路，<br/>以及把它做大的计划</h1>
    <div class="rule"></div>
    <p class="lead">重要的事，八页说完：来了多少客人、他们从哪里来、
    各条路实际带来了多少钱、这六个月攒下了什么、九月十月要做什么，以及能做到哪一步。
    这里所有的数字，都是真的联系过店里的人 —— 打过电话的、发过消息的、网上约过的。
    点赞和播放量一个都不算。</p>
    <div class="chips">
      {chip(I.GOOGLE,'i-google','谷歌')}
      {chip(I.IG,'i-ig','Instagram')}
      {chip(I.FB,'i-fb','Facebook')}
      {chip(I.TT,'i-tt','TikTok')}
      {chip(I.TW,'i-tw','Treatwell')}
      {chip(I.WA,'i-wa','WhatsApp')}
    </div>
    <div class="meta">
      <div><dt>客户</dt><dd>东方精华 · 养生中心</dd></div>
      <div><dt>负责人</dt><dd>Alexander Fania &amp; Federico Delfino</dd></div>
      <div><dt>统计时间</dt><dd>2026 年 3 月 – 8 月（六个月）</dd></div>
      <div><dt>完整版</dt><dd>另附 19 页详细报告</dd></div>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 2 · 数字
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">01 — 数字</div>
  <h2>从每月 13 位客人，到 61 位</h2>
  <div class="rule"></div>
  <p class="lead">这六个月最重要的收获，不是粉丝多了多少，
  而是：现在有一条路，每天都能把真的客人带到店里，而且我们数得清楚。六个月前没有这条路。</p>
  <div class="g4" style="margin:4mm 0">
    {kpi("61","上个月来的客人","打电话、发消息、网上约","vio")}
    {kpi("55","从谷歌来的客人","撑起整个生意的一条路")}
    {kpi("&gt;90%","一百个人里九十个","都是从谷歌来的")}
    {kpi("5,0&#9733;","谷歌上的评分","106 条真实评价")}
  </div>
  <table style="margin:4mm 0 3mm">
    <thead><tr><th>月份</th><th class="n">谷歌</th><th class="n">Instagram</th>
      <th class="n">Facebook</th><th class="n">TikTok</th><th class="n">合计</th>
      <th style="width:20%">变化</th></tr></thead>
    <tbody>
      <tr><td class="ch">2026 年 3 月</td><td class="n">10</td><td class="n">2</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>13</strong></td><td><span class="bar"><i class="grey" style="width:21%"></i></span></td></tr>
      <tr><td class="ch">2026 年 4 月</td><td class="n">13</td><td class="n">2</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>16</strong></td><td><span class="bar"><i class="grey" style="width:26%"></i></span></td></tr>
      <tr><td class="ch">2026 年 5 月</td><td class="n">17</td><td class="n">2</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>20</strong></td><td><span class="bar"><i class="grey" style="width:33%"></i></span></td></tr>
      <tr><td class="ch">2026 年 6 月</td><td class="n">21</td><td class="n">3</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>25</strong></td><td><span class="bar"><i class="grey" style="width:41%"></i></span></td></tr>
      <tr><td class="ch">2026 年 7 月</td><td class="n">28</td><td class="n">3</td><td class="n">1</td><td class="n">0</td>
          <td class="n"><strong>32</strong></td><td><span class="bar"><i class="grey" style="width:52%"></i></span></td></tr>
      <tr><td class="ch">2026 年 8 月 <span class="pill gold" style="margin-left:1.5mm">机器记录</span></td>
          <td class="n">55</td><td class="n">4</td><td class="n">1–2</td><td class="n">0</td>
          <td class="n"><strong>约 61</strong></td><td><span class="bar"><i class="gold" style="width:100%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="g2">
    <div class="note vio">
      <h4>两件事分开看</h4>
      <p style="margin-bottom:0">三月到七月<strong>一分钱广告都没投</strong>：
      客人从 13 位涨到 32 位（<strong>多了 1,5 倍</strong>），靠的是重做的网站、
      八个项目介绍页，以及店铺在谷歌搜索结果里往前挪了。
      然后 <strong>7 月 27 日</strong>谷歌广告开始：一个月内客人又差不多翻了一倍，
      从 32 位到 61 位（<strong>接近 2 倍</strong>）。
      这两件事是配合起作用的：把后面那件停掉，数字退回去的不是几个星期，是几个月。</p>
    </div>
    <div class="note amber">
      <h4>前几个月的数字是怎么来的</h4>
      <p style="margin-bottom:0">记录工具是 7 月才装的：
      所以 3 月到 6 月的数字，是我们根据预约本、接到的电话和登记的预约
      <strong>倒推出来的</strong>，不是机器记的，这一点我们如实写明。
      八月的才是机器一条一条记下来的 —— 这也是前几个月最重要的成果：
      今天东方精华知道客人从哪里来。以前不知道。</p>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 3 · 来源
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">02 — 客人从哪来，怎么约</div>
  <h2>客人从哪里找到店里，又是怎么约的</h2>
  <div class="rule"></div>
  <p class="lead">这是机器记录的那个月（2026 年 7 月 27 日 – 8 月 27 日）的真实情况，
  九月十月所有的安排都是根据它定的。</p>
  <table style="margin:4mm 0 3mm">
    <thead><tr><th style="width:34%">来源</th><th class="n">客人数</th>
      <th style="width:26%">占多少</th><th class="n">比例</th><th class="n">花广告费了吗</th></tr></thead>
    <tbody>
      <tr><td class="ch">谷歌（免费搜索 + 广告）</td><td class="n"><strong>55</strong></td>
          <td><span class="bar"><i class="gold" style="width:100%"></i></span></td><td class="n">90%</td><td class="n">花了</td></tr>
      <tr><td class="ch">Instagram（全部免费）</td><td class="n"><strong>4</strong></td>
          <td><span class="bar"><i style="width:7.3%"></i></span></td><td class="n">7%</td><td class="n">€0</td></tr>
      <tr><td class="ch">Facebook（大概数）</td><td class="n">1–2</td>
          <td><span class="bar"><i class="grey" style="width:2.7%"></i></span></td><td class="n">2–3%</td><td class="n">€0</td></tr>
      <tr><td class="ch">TikTok</td><td class="n">0</td>
          <td><span class="bar"><i class="grey" style="width:0"></i></span></td><td class="n">0%</td><td class="n">€0</td></tr>
    </tbody>
    <tfoot><tr><td>这个月一共</td><td class="n">约 61</td><td></td><td class="n">100%</td><td class="n"></td></tr></tfoot>
  </table>
  <div class="legend" style="margin-bottom:4mm">
    <span><i style="background:linear-gradient(135deg,#E7C568,#C99C2E)"></i>看到广告来的 — 约 35–40 位</span>
    <span><i style="background:linear-gradient(135deg,#5B35E8,#1E4FD8)"></i>自己搜到、没花钱的 — 约 15–20 位</span>
  </div>
  <div class="g2u">
    <div>
      <h4>客人实际是怎么约的</h4>
      {row(I.TEL,'i-tel','打电话 — 最多人用的方式',
         '带来客人最多，尤其是在谷歌上搜到或看到广告的人。晚上六点半搜「亚历山德里亚 按摩」的人，想的是现在就约，他会直接打过来。')}
      {row(I.TW,'i-tw','网上预约 — 关了门也在接单',
         '客人在网站上自己约好，不用打电话。和打电话一样稳，而且店里关门、或您手上正忙的时候，它照样在接单。')}
      {row(I.WA,'i-wa','发 WhatsApp — 还在犹豫的人',
         '大多是先看了 Instagram 上的内容。会发消息的人，通常是约之前还有问题想问：回得快不快，和价格一样重要。')}
    </div>
    <div>
      <div class="note amber" style="margin-bottom:3.6mm">
        <h4>Facebook：1–2 位，而且是估的</h4>
        <p style="margin-bottom:0">Facebook 后台的数字看不准，所以只能给个大概。
        能确定的是，这条路作用很小。</p>
      </div>
      <div class="note" style="margin-bottom:3.6mm">
        <h4>TikTok：一位客人都没有</h4>
        <p style="margin-bottom:0">统计的这个月一位都没带来。
        花在这里的时间，是从 Instagram 和谷歌那里挪走的。</p>
      </div>
      <div class="note vio">
        <h4>Instagram：4 位客人，一分钱没花</h4>
        <p style="margin-bottom:0">数量不多，但这是最值得注意的信号：
        喜欢这些内容的人是存在的，缺的只是发得不够多、不够稳。</p>
      </div>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 4 · 营业额
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">03 — 营业额</div>
  <h2>两个半月，光网上预约就做了 €1.275</h2>
  <div class="rule"></div>
  <p class="lead">这不是估的：是 <strong>Treatwell（网上预约平台）后台的销售单</strong>，
  您随时可以自己打开看。时间是 <strong>2026 年 7 月 7 日到 9 月 19 日</strong>，
  也就是从谷歌广告开始前不久一直到今天。</p>
  <div class="g3" style="margin:4mm 0">
    {kpi("&euro;1.275","网上预约的营业额","2026 年 7 月 7 日 &rarr; 9 月 19 日","vio")}
    {kpi("33","做了多少次","全部来自后台单据，含税")}
    {kpi("&euro;38,6","平均每次多少钱","€1.275 ÷ 33 次")}
  </div>
  <div class="g2u">
    <div class="card">
      <h4>客人具体约了哪些项目</h4>
      <table style="margin-top:1.5mm">
        <tbody>
          <tr><td class="ch">精油按摩（颈部、背部…）</td><td class="n">11</td><td class="n">€420</td></tr>
          <tr><td class="ch">足底按摩</td><td class="n">8</td><td class="n">€275</td></tr>
          <tr><td class="ch">修脚</td><td class="n">8</td><td class="n">€280</td></tr>
          <tr><td class="ch">水疗按摩</td><td class="n">2</td><td class="n">€150</td></tr>
          <tr><td class="ch">推拿指压</td><td class="n">2</td><td class="n">€100</td></tr>
          <tr><td class="ch">拔罐</td><td class="n">1</td><td class="n">€25</td></tr>
          <tr><td class="ch">采耳</td><td class="n">1</td><td class="n">€25</td></tr>
        </tbody>
        <tfoot><tr><td>合计</td><td class="n">33</td><td class="n">€1.275</td></tr></tfoot>
      </table>
    </div>
    <div class="note vio">
      <h4>九月不是变差了，是在变好</h4>
      <p>把同一份销售单分成前后两段看：</p>
      <ul class="ticks">
        <li><strong>7 月 7 日 – 8 月 28 日</strong>（53 天）：€875 → <strong>每天 €16,5</strong></li>
        <li><strong>8 月 29 日 – 9 月 19 日</strong>（22 天）：€400 → <strong>每天 €18,2</strong></li>
      </ul>
      <p style="margin:2mm 0 0">每天多做了 <strong>10%</strong>，
      而且偏偏是在大家都觉得最淡的月份：刚放完假回来，学费和各种开销一起来，工资还没缓过来。
      在这种情况下还能往上走，那么十月 —— 开销花完、天气转凉、腰酸背痛的人多起来 ——
      才是真正能看出成绩的月份。</p>
    </div>
  </div>
  <div class="note amber" style="margin-top:3.6mm">
    <h4>那些没走网上预约的钱呢？</h4>
    <p style="margin-bottom:0">这 €1.275 <strong>只是网上约的那部分</strong>。
    从谷歌来的客人大多是打电话或发 WhatsApp 来约的，这笔钱直接进收银台，不经过预约平台。
    我们保守估计：<strong>光八月一个月，谷歌那边大约还有 €420</strong>，
    <strong>Instagram 大约 €60</strong>，按来联系的人数乘以平均每次消费算出来。
    所以这段时间真正的总数<strong>比 €1.275 高不少</strong>，不会更低。</p>
  </div>
"""})

# ---------------------------------------------------------------- 5 · 资产 + 时机
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">04 — 已经攒下来的东西</div>
  <h2>今天店里有、而六个月前没有的</h2>
  <div class="rule"></div>
  <div class="g2">
    <ul class="ticks">
      <li><strong>一个为了让人来约的网站：</strong>八个项目各一页，价格写清楚、真实照片、预约按钮。每条广告都把客人送到对应那一页</li>
      <li><strong>一套以前完全没有的记录系统：</strong>能看到有多少人打电话、发消息、点开网上预约 —— 还能看到他们是看了哪条广告来的</li>
    </ul>
    <ul class="ticks">
      <li><strong>一个理顺并调过一轮的谷歌广告账户：</strong>六组广告，只烧钱的搜索词已清掉，只让本地和附近的人看到，文字也跑了一个月</li>
      <li><strong>一份比广告还值钱的好口碑：</strong>5,0★、106 条评价。附近任何同行，两个月都买不到</li>
    </ul>
  </div>
  <div class="note amber" style="margin:3.6mm 0">
    <p style="margin-bottom:0">这四样是整件事里<strong>「慢」的那部分</strong>：
    网站只做一次，记录只装一次，好评要积累好几年，广告账户要调好几个星期才出稳定数字。
    <strong>这些都已经做完、钱也付过了。</strong>接下来是「快」的那部分，也就是真正翻倍的部分。</p>
  </div>
  <hr class="hr"/>
  <div class="eyebrow">05 — 时间点</div>
  <h2>为什么现在最不该停</h2>
  <div class="rule"></div>
  <ul class="ticks" style="margin-bottom:3.6mm">
    <li><strong>广告才跑一个月，就带来 55 位客人。</strong>它靠数据自己变聪明：现在关掉，等于把让它以后更省钱的那一个月数据全扔了</li>
    <li><strong>被统计的这个月是八月，一年里最差的月份。</strong>那 61 位客人是地板，不是天花板：从九月起，按摩和腰背理疗的需求会自然回来</li>
    <li><strong>九月到十二月决定一整年。</strong>对养生店来说这是最旺的时候：上班压力、送礼、礼品卡、套餐。带着热好的机器进十一月，是从十一月才开始怎么也追不回来的</li>
  </ul>
  <div class="g2">
    <div class="card quiet">
      <h4>如果今天全部停掉</h4>
      <ul class="ticks grey">
        <li>广告一停：每月 55 位从谷歌来的客人，24 小时内就没了</li>
        <li>只剩自己搜到的客人：大约 15–20 位，不是 55 位</li>
        <li>攒下的一个月数据作废，还在投的同行把这些人接走</li>
        <li>半年后再来一遍，「学」的阶段要从头再走</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">如果把这两个月做完</h4>
      <ul class="ticks">
        <li>广告进入更便宜、更容易带来预约的阶段</li>
        <li>从 Facebook 和 TikTok 省下的钱，投到已经证明管用的地方</li>
        <li>Instagram 从「白来的 4 位」变成一条有计划的路</li>
        <li>到十二月做决定时，手里拿的是<em>数字</em>，不是感觉</li>
      </ul>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 6 · 计划
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">06 — 计划</div>
  <h2>九月和十月，有什么不一样</h2>
  <div class="rule"></div>
  <div class="g2">
    <div class="card">
      <h4 style="color:var(--violet)">谷歌 —— 把已经管用的做大</h4>
      <ul class="ticks">
        <li><strong>给能带来电话的那几组广告加钱</strong>，不是平均加：只加在真的带来预约的那几组</li>
        <li><strong>广告改成「以约成为目标」</strong>：不再只求有人点进来，而是求真的约成</li>
        <li><strong>只在有人接电话的时段</strong>，广告上才出现「打电话」按钮</li>
        <li><strong>每条广告写上价格和评分</strong>：少一些只看不约的点击，来的人质量更高</li>
        <li><strong>十月起把看过的人找回来</strong>：看过价格没约的，过几天再提醒一次</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="color:var(--violet)">内容、网上预约和谷歌地图</h4>
      <ul class="ticks">
        <li><strong>Instagram 按计划表发</strong>，围绕谷歌上最多人搜的项目，不再想到才发</li>
        <li><strong>每条内容都有一句「现在就来约」</strong>：打电话、发消息，或网上约</li>
        <li><strong>Treatwell 页面整个重做</strong>：照片、说明、时长、价格，并对人少的时段放优惠</li>
        <li><strong>每周打理谷歌地图店铺页面</strong>：发动态、换照片、回复所有评价。不要钱，却是最没用起来的一件事</li>
      </ul>
    </div>
  </div>
  <div class="g2" style="margin-top:3.6mm">
    <div class="note">
      <h4>请老客人再来 —— 十月开始</h4>
      <ul class="ticks">
        <li><strong>30 天没再来的，发一条消息</strong>提醒他上次做的项目，点两下就能再约。成本：零</li>
        <li><strong>圣诞套餐和礼品卡现在就备好</strong>，十二月是在卖货，不是临时凑</li>
        <li><strong>人少的时段做限时优惠</strong>：房租人工不变，收入变多</li>
      </ul>
    </div>
    <div class="note amber">
      <h4>Facebook 换用法，TikTok 先停</h4>
      <p><strong>Facebook 不关：</strong>不再给陌生人投广告，改成用来提醒看过网站的人，
      以及同步 Instagram 的内容。十月以后那边的增长就从这来。</p>
      <p style="margin-bottom:0"><strong>TikTok 先停：</strong>一位客人都没有不是运气，是拍法不对。
      要节奏快、要有人出镜、要用「跟着我进店」的拍法，每周 4–5 条连发两个月。
      只要还没有人愿意出镜，花在那里的每个钟头都是从 Instagram 和谷歌挪走的。
      怎么拍、说什么、剪辑我们准备，店里出一个愿意上镜的人。</p>
    </div>
  </div>
  <div class="g2" style="margin-top:3.6mm">
    <div class="note">
      <h4>需要店里配合的</h4>
      <ul class="ticks">
        <li>做项目时拍的照片和短视频，手机拍就行</li>
        <li>客人说「我是在……看到你们的」，告诉我们一声</li>
        <li>营业时间内几个钟头内回 WhatsApp，每次做完都请客人留谷歌评价</li>
      </ul>
    </div>
    <div class="note vio">
      <h4>我们负责的</h4>
      <ul class="ticks">
        <li>谷歌广告和「把看过的人找回来」，全部由我们管</li>
        <li>每月发布计划，文字写好直接发</li>
        <li>Treatwell、谷歌地图店铺页面，以及每月的报告</li>
      </ul>
    </div>
  </div>
"""})

# ---------------------------------------------------------------- 7 · 时间表 + 预计
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">07 — 时间表</div>
  <h2>接下来八个星期</h2>
  <div class="rule"></div>
  <div class="tl">
    <div class="it next"><div class="w">第 1–2 周 · 九月下旬</div>
      <h3>把钱挪过去，广告改成「以约成为目标」</h3>
      <p style="margin-bottom:0">Facebook 和 TikTok 的钱收回来，投到表现好的几组谷歌广告上。打开「打电话」按钮和价格显示。第一次清理只花钱不带客人的搜索词。</p></div>
    <div class="it next"><div class="w">第 3–4 周 · 十月上旬</div>
      <h3>整理 Treatwell 和谷歌地图店铺页面</h3>
      <p style="margin-bottom:0">项目说明重写，换新照片，给人少的时段放优惠。开始每周发谷歌动态，把所有评价都回复掉。</p></div>
    <div class="it next"><div class="w">第 5–6 周 · 十月中旬</div>
      <h3>Instagram 按计划发，开始把看过的人找回来</h3>
      <p style="margin-bottom:0">围绕最多人搜的项目按计划发。开始向来过网站但没约的人再提醒一次。</p></div>
    <div class="it next"><div class="w">第 7–8 周 · 十月下旬</div>
      <h3>请老客人再来，准备圣诞</h3>
      <p style="margin-bottom:0">给 30 天以上没再来的客人发第一批消息。礼品卡页面和圣诞套餐备好，十一月第一周就能卖。</p></div>
  </div>
  <hr class="hr"/>
  <div class="eyebrow">08 — 预计</div>
  <h2>六个月以后能到什么位置</h2>
  <div class="rule"></div>
  <p style="margin-bottom:3mm">谷歌每月多 15%；Instagram 从十月起因为按计划发内容而加快；
  Facebook 从十月起换新用法重新起来；TikTok 先停着。</p>
  <table>
    <thead><tr><th>月份</th><th class="n">谷歌</th><th class="n">Instagram</th><th class="n">Facebook</th>
      <th class="n">TikTok</th><th class="n">合计</th><th style="width:18%">变化</th></tr></thead>
    <tbody>
      <tr><td class="ch">2026 年 8 月 <span class="pill gold" style="margin-left:1.5mm">真实</span></td>
          <td class="n">55</td><td class="n">4</td><td class="n">1–2</td><td class="n">0</td>
          <td class="n"><strong>约 61</strong></td><td><span class="bar"><i class="gold" style="width:38%"></i></span></td></tr>
      <tr><td class="ch">2026 年 9 月</td><td class="n">63</td><td class="n">5</td><td class="n">2</td><td class="n">停</td>
          <td class="n"><strong>约 70</strong></td><td><span class="bar"><i style="width:43%"></i></span></td></tr>
      <tr><td class="ch">2026 年 10 月</td><td class="n">73</td><td class="n">8</td><td class="n">6</td><td class="n">停</td>
          <td class="n"><strong>约 87</strong></td><td><span class="bar"><i style="width:54%"></i></span></td></tr>
      <tr><td class="ch">2026 年 11 月</td><td class="n">84</td><td class="n">11</td><td class="n">8</td><td class="n">停</td>
          <td class="n"><strong>约 103</strong></td><td><span class="bar"><i style="width:64%"></i></span></td></tr>
      <tr><td class="ch">2026 年 12 月</td><td class="n">96</td><td class="n">14</td><td class="n">10</td><td class="n">停</td>
          <td class="n"><strong>约 120</strong></td><td><span class="bar"><i style="width:74%"></i></span></td></tr>
      <tr><td class="ch">2027 年 1 月</td><td class="n">111</td><td class="n">17</td><td class="n">12</td><td class="n">停</td>
          <td class="n"><strong>约 140</strong></td><td><span class="bar"><i style="width:86%"></i></span></td></tr>
      <tr><td class="ch">2027 年 2 月</td><td class="n">127</td><td class="n">21</td><td class="n">14</td><td class="n">停</td>
          <td class="n"><strong>约 162</strong></td><td><span class="bar"><i style="width:100%"></i></span></td></tr>
    </tbody>
  </table>
  <div class="note amber" style="margin-top:3mm">
    <p style="margin-bottom:0"><strong>到明年二月，客人多 1,7 倍，能查到的营业额大约每月 €2.700</strong>，
    现在大约 €1.030，希望每带来一位客人的广告费不超过 €18。
    这是<strong>预计，不是保证</strong>：某个月没涨，我们会写进报告然后换做法 ——
    就像我们对 TikTok 做的那样。</p>
  </div>
"""})

# ---------------------------------------------------------------- 8 · 三种走法 + 提议
PAGES.append({"cls": "dense", "body": f"""
  <div class="eyebrow">09 — 期望值</div>
  <h2>这件事能做到什么程度：三种走法</h2>
  <div class="rule"></div>
  <p class="lead">每一个营业额目标，最后都会变成「每天要接待几位客人」。
  下面是未来六个月的三种走法。</p>
  <table style="margin:3.6mm 0">
    <thead><tr><th style="width:22%">走法</th><th>有什么不一样</th>
      <th class="n">明年 2 月<br/>每月客人</th><th class="n">每天<br/>几位</th>
      <th class="n">能查到的<br/>营业额</th></tr></thead>
    <tbody>
      <tr><td class="ch">A · 保持现在这样</td><td>广告钱不加，也不做新的事</td>
          <td class="n">约 95</td><td class="n">约 3</td><td class="n">约 €1.500</td></tr>
      <tr><td class="ch">B · 稳稳地做大 <span class="pill vio" style="margin-left:1.5mm">建议</span></td>
          <td>就是这份文件里的计划：谷歌多投、按计划发内容、把看过的人找回来、整理网上预约</td>
          <td class="n"><strong>约 162</strong></td><td class="n"><strong>约 5–6</strong></td><td class="n"><strong>约 €2.700</strong></td></tr>
      <tr><td class="ch">C · 大力推</td><td>谷歌钱翻一倍以上，Facebook 和 Instagram 也开始花钱投，加节日活动</td>
          <td class="n">约 240</td><td class="n">约 8</td><td class="n">约 €4.200</td></tr>
    </tbody>
  </table>
  <div class="g2u">
    <div class="note">
      <h4>难的地方会从哪里换到哪里</h4>
      <ul class="ticks">
        <li><strong>每天 3–4 位以内</strong>，难的是怎么把人叫来：这是我们的活</li>
        <li><strong>每天 5–6 位</strong>，难的还是把人叫来，但预约要排得有条理，电话和消息要回得快</li>
        <li><strong>每天 8 位以上</strong>，难的就不是广告了：是时间够不够、床位够不够、人手够不够</li>
      </ul>
    </div>
    <div class="note amber">
      <h4>把账算给您看</h4>
      <p style="margin-bottom:0">按平均每次 <strong>€38,6</strong> 算：
      <strong>一个月 €2.000 = 52 次</strong>（约每天 2 次）·
      <strong>€5.000 = 129 次</strong>（约每天 4 次）·
      <strong>€10.000 = 259 次</strong>（约每天 9 次，一天都不休）。再往上广告就帮不上忙了：
      人带来了没人做，也变不成钱。
      <strong>我们能答应</strong>每月带来更多真心想来的客人，一位一位数给您看，
      也能答应如实说什么没用。<strong>我们不能答应</strong>一个具体的营业额数字，
      因为还要看店里能接待多少客人。</p>
    </div>
  </div>
  <div class="cta" style="margin-top:3.8mm">
    <h3 style="font-size:11pt;margin-bottom:2mm">我们的提议，很具体</h3>
    <ul class="ticks">
      <li><strong>九月和十月，两个月先看结果</strong>，计划一条不落全部做完 —— 我们建议走 B。</li>
      <li><strong>十月底交一份报告</strong>：每条路带来多少客人、每位客人花了多少钱、和八月直接对比。</li>
      <li><strong>十一月看着数字做决定</strong>，不是看感觉。如果结果没出来，我们会像这里写 TikTok 一样如实写出来。</li>
    </ul>
  </div>
  <div class="sign" style="margin-top:4mm">
    <div class="n">Alexander Fania &amp; Federico Delfino</div>
    <div class="s">Apex Media · 广告与客户增长公司 · 本文件为东方精华 · 养生中心编制</div>
  </div>
"""})
