from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("billing_api", "0023_customer_customer_tenant_expiry_idx")]

    operations = [
        migrations.AddField(
            model_name="adminauditlog",
            name="actor_type",
            field=models.CharField(blank=True, default="admin", max_length=24),
        ),
        migrations.AddField(
            model_name="adminauditlog",
            name="tenant_id",
            field=models.CharField(blank=True, db_index=True, max_length=80, null=True),
        ),
    ]
