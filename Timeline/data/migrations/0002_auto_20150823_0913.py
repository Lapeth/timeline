# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations

def lang(apps, schema_editor):
    Language = apps.get_model("Timeline_data", "Language")
    en = Language()
    en.id = 1
    en.code = 'en'
    en.indexing = 1
    en.name = "English"
    en.save()
    da = Language()
    da.id = 2
    da.code = 'da'
    da.indexing = 2
    da.name = "Dansk"
    da.save()

class Migration(migrations.Migration):

    dependencies = [
        ('Timeline_data', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Language',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('code', models.CharField(max_length=5)),
                ('indexing', models.IntegerField(unique=True)),
                ('name', models.CharField(max_length=20)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.RunPython(lang),
        migrations.AddField(
            model_name='eventbase',
            name='group',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='eventbase',
            name='language',
            field=models.ForeignKey(default=1, to='Timeline_data.Language'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='tagbase',
            name='group',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='tagbase',
            name='language',
            field=models.ForeignKey(default=1, to='Timeline_data.Language'),
            preserve_default=False,
        ),
    ]
