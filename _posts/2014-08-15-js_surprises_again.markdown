---
layout: post
title:  "Більше анігдотів про JS"
date:   2014-08-15 12:11:32
---

Продовжую читати книжечку про жабоскрипт і писати всякі гелоуворлди, і продовжую трохи дивуватись.
Ця вся їхня штука з прімітівс і об'єктами все ж дивна. Наприклад, книжка пише, що коли ти пробуєш
викликати якийсь метод на стрічці, створиться об'єкт типу String, звідти метод візьметься, потім цей
об'єкт викинуть геть. Те ж саме станеться, якщо спробувати стрічці приписати який-небудь атрибут. Ось так:

{% highlight javascript %}
> var s = "test";
undefined
> s.len = 4;
4
> s.len;
undefined
{% endhighlight %}

З іншого боку:

{% highlight javascript %}
> s = new String("test");
"test"
> s.len = 4;
4
> s.len;
4
{% endhighlight %}

Пайтон взагалі не дозволить вчинити такої наруги над стрічкою:

{% highlight python %}
>>> s = 'test'
>>> s.length = 4
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'str' object has no attribute 'length'
{% endhighlight %}

Також у жабоскрипті різні об'єкти ніколи (?) не бувають рівними:

{% highlight javascript %}
> [] == [];
false
{% endhighlight %}

Але якщо порівнювати об'єкт і примітив, то жабоскрипт попробує перетворити перший у другий. Тому:

{% highlight javascript %}
> 0 == [];
true
{% endhighlight %}

Тобто 0 більше схожий на порожній масив ніж... порожній масив? Хм.

Мені здається ось так логічніше:

{% highlight python %}
>>> [] == []
True
>>> [] is []
False
{% endhighlight %}

О, ще знайшла:

{% highlight javascript %}
var a = [], b =[];
undefined
a >= b;
true
a <= b;
true
a == b;
false
{% endhighlight %}

Також мені не вистачає ліст компрігеншнс і не подобаються їхні фор лупи, тому я використовую всякі map і
filter, хоча, мабуть, у них так не прийнято.

Але треба вже читати про якісь серйозніші речі.
