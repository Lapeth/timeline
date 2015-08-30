# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import Timeline.data.models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='EventBase',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('key', models.CharField(max_length=20)),
                ('publicRevision', models.IntegerField()),
                ('enabled', models.BooleanField(default=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='EventVersion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('revision', models.IntegerField(editable=False)),
                ('title', models.CharField(max_length=50, verbose_name=b'Event title')),
                ('text', models.TextField(verbose_name=b'Event contents')),
                ('date', Timeline.data.models.TimeField(null=True, verbose_name=b'Event date', blank=True)),
                ('wiki', models.CharField(max_length=75, null=True, verbose_name=b'Wikipedia link', blank=True)),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name=b'Version timestamp')),
                ('base', models.ForeignKey(to='Timeline_data.EventBase')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TagBase',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('key', models.CharField(max_length=20)),
                ('publicRevision', models.IntegerField()),
                ('enabled', models.BooleanField(default=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TagVersion',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('revision', models.IntegerField(editable=False)),
                ('title', models.CharField(max_length=50, verbose_name=b'Tag title')),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name=b'Version timestamp')),
                ('base', models.ForeignKey(to='Timeline_data.TagBase')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='eventversion',
            name='tags',
            field=models.ManyToManyField(to='Timeline_data.TagBase'),
            preserve_default=True,
        ),
    ]
