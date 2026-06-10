create or replace view v_sales_order_amount_check as
select
    so.so_id,
    so.customer_id,
    so.status,
    so.total_amount,
    sum(nvl(sod.amount, 0)) as detail_amount_sum,
    case
        when nvl(so.total_amount, 0) = sum(nvl(sod.amount, 0))
            then 'Y'
        else 'N'
        end as header_detail_amount_matched_yn,
    count(sod.so_detail_id) as detail_line_count,
    sum(nvl(sod.order_qty, 0) * nvl(sod.unit_price, 0)) as detail_calculated_amount_sum,
    case
        when sum(nvl(sod.amount, 0))
            = sum(nvl(sod.order_qty, 0) * nvl(sod.unit_price, 0))
            then 'Y'
        else 'N'
        end as detail_amount_calculated_matched_yn
from sales_order so
         left join sales_order_detail sod
                   on sod.so_id = so.so_id
group by
    so.so_id,
    so.customer_id,
    so.status,
    so.total_amount;