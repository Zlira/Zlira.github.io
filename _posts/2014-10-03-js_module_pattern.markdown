---
layout: post
title:  "Паттерн модуль у JS"
date:   2014-10-04 14:06:32
---

Значить, про паттерн модуль у js. Я ще буду тут дописувати, але поки запушаю, як є.

##Нащо?
Як пише [тут](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript), 
він використовується для того, щоб емулювати поняття класу таким чином, щоб можна було влючити до нього як
приватні так і публічні атрибути і методи і захистити частину змінних від глобального простору.
Таким чином зменшується імовірність зіткнення імен з інших місць. Ми повертаємо тільки публічний інтерфейс для
роботи з модулем у вигляді об'єкта.

[Пишуть](https://carldanley.com/js-module-pattern/), що в js цей паттерн використовується найчастіше, в тому числі
вcякими-там jQuery, Dojo, ExtJS і YUI.

##Що використовується?
Для того, щоб зробити модуль треба використати дві основні штуки: по-преше [замикання](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures),
по-друге [Immediately-invoked function expression](http://localhost:4000/2014/10/04/immediate_invoked_function_expression/).
Замикання, це функція, яка пам'ятає середовище, в якому її створили. Найчастіше - функція визначена всередині
іншої функції. А про iffy я вже собі законспектувала. Одним словом, як написано [ось тут](http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html), модуль - це таке-собі
анонімне замикання, яке забезпечує приватність і збереження стану.

##Простесенький приклад
Приклад трохи модифікований [звідти ж](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript).
Це якийсь собі модуль, який вміє рахувати. У нього є одна приватна змінна, до якої ніяк не достукаєшся з
глобального простору, але також у нього є публічні методи, з якими можна працювати:
{% highlight javascript %}
> var countingModule = (function() {
      var counter = 0;
      return {
          getCount: function() {
              return counter;
          },
          increment: function() {
              return counter++;
          },
          reset: function() {
              console.log('counter value prior to reset ' + counter);
              counter = 0;
          }
      };
  })();
undefined 
> counter;
ReferenceError: counter is not defined
> var counter1 = countingModule;
undefined
> counter1.getCount();
0
> counter1.increment();
0
> counter1.getCount();
1
> counter1.increment();
1
> counter1.reset();
undefined
"counter value prior to reset 2"
{% endhighlight %}

##[Ім|Екс]портування глобальних змінних
Інколи модуль хоче використати/змінити якісь глобальні змінні. Це, в принципі, зробити не важко, бо достатньо
тільки написати назву відповідної змінної без `var`. Але так робити не треба, бо потім невідомо, звідки ті
глобальні змінні взялись, краще взяти й імпорутвати. Ось так:
{% highlight javascript %}
(function ($, window) {
	// now have access to globals jQuery (as $) and window in this code
}(jQuery, window));
{% endhighlight %}

А якщо глобальні змінні треба не використати, а декларувати, то їх треба експортувати:
{% highlight javascript %}
var MODULE = (function () {
	var my = {},
		privateVariable = 1;

	function privateMethod() {
		// ...
	}

	my.moduleProperty = 1;
	my.moduleMethod = function () {
		// ...
	};

	return my;
}());
{% endhighlight %}

##Додати методів до модуля
По-ідеї, всесь модуль має лежати в одному файлі, інакше нічого не вийде. Або вийде. Якщо взяти його, імортувати,
додати щось і експортувати назад. Наприклад, додамо чогось до нашого каунтера:
{% highlight javascript %}
var countingModule = ( function (mod) {
    mod.squareCount = function() {
        return Math.pow(this.getCount(), 2);
    }
    return mod;
})(countingModule);
{% endhighlight %}
Правда, от до самої змінної `counter`, по-моєму, ніяк не достукаєшся. Я спрешу хотіла додати йому метод `decrement`, але не знаю, чи це можливо.

##Недоліки
Приватні методи важко тестувати.

