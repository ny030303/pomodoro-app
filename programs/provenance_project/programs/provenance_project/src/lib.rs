use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Transfer};

declare_id!("E4Ctii4zDZ89quHkeDhgLkJkV9xynWgwcpnF1Fbtdhht");

#[program]
pub mod provenance_project {
    use super::*;

    pub fn log_effort(ctx: Context<LogEffort>, effort_data: String) -> Result<()> {
        let log_account = &mut ctx.accounts.log_account;
        let user = &ctx.accounts.user;

        log_account.authority = *user.key;
        log_account.timestamp = Clock::get()?.unix_timestamp;
        log_account.effort_data = effort_data;

        Ok(())
    }

    // purchase_item 함수 추가
    pub fn purchase_item(ctx: Context<PurchaseItem>, item_id: u32, price: u64) -> Result<()> {
        // buyer가 보유한 토큰을 treasury로 전송
        let cpi_accounts = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, price)?;

        // 구매 내역 기록
        let purchase_log = &mut ctx.accounts.purchase_log;
        purchase_log.buyer = *ctx.accounts.buyer.key;
        purchase_log.item_id = item_id;
        purchase_log.timestamp = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

// PurchaseLog 구조체
#[account]
pub struct PurchaseLog {
    pub buyer: Pubkey,
    pub item_id: u32,
    pub timestamp: i64,
}

#[derive(Accounts)]
pub struct PurchaseItem<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Buyer token account, unchecked but used safely in token::transfer CPI
    #[account(mut)]
    pub buyer_token_account: AccountInfo<'info>,

    /// CHECK: Treasury token account, unchecked but used safely in token::transfer CPI
    #[account(mut)]
    pub treasury_token_account: AccountInfo<'info>,

    #[account(init, payer = buyer, space = 8 + 32 + 4 + 8)]
    pub purchase_log: Account<'info, PurchaseLog>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}


// 기존 LogEffort 구조체와 Context는 그대로 유지
#[account]
pub struct EffortLog {
    pub authority: Pubkey,
    pub timestamp: i64,
    pub effort_data: String,
}

#[derive(Accounts)]
pub struct LogEffort<'info> {
    #[account(init, payer = user, space = 102)]
    pub log_account: Account<'info, EffortLog>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
