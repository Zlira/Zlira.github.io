---
layout: post
title:  "Правдива брехня в JS"
date:   2014-08-11 22:07:32
---

Жабоскрипт має якийсь цікавий спосіб перетворення різних типів у булеві значення.
Цікавість полягає у тому, що всі об'єкти завжди обов'язково перетворюються у `True`.
Тому:

{% highlight javascript %}
> Boolean('');
false
{% endhighlight %}

а
{% highlight javascript %}
> Boolean([]);
true
{% endhighlight %}

Хоча, це ще не цікаво, цікавіше от що:

{% highlight javascript %}
> var lie = new Boolean(false);
undefined
> lie
false
> Boolean(lie)
true
> if (lie) {console.log("truthy lie")};
undefined
"truthy lie"
{% endhighlight %}

Звичайно, не слід користуватись об'єктом `Boolean` але все одно це якось по-наркоманськи. 
