use anchor_lang::prelude::*;
// use anchor_spl::token::{self, Token, Transfer};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

declare_id!("EzosdZfmUqa4hYH7iT2dyCJA45kfAtoGp7VTKq2NYJAP");

#[program]
pub mod provenance_project {
    use super::*;

    pub fn log_effort(ctx: Context<LogEffort>, effort_data: String) -> Result<()> {
        let log_account = &mut ctx.accounts.log_account;
        let user = &ctx.accounts.user;
        let authority = &ctx.accounts.authority; // authority를 가져옵니다.

        log_account.authority = *authority.key; // 생성 주체를 authority로 기록
        log_account.user = *user.key; // 노력의 주체는 user로 기록
        log_account.timestamp = Clock::get()?.unix_timestamp;
        log_account.effort_data = effort_data;

        // ✅ --- 토큰 보상 로직 추가 ---
        let amount = 10 * 10u64.pow(ctx.accounts.mint.decimals as u32); // 10 $EFFORT (소수점 고려)

        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token_account.to_account_info(),
            to: ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    // ✅ purchase_item 함수 수정
    pub fn purchase_item(ctx: Context<PurchaseItem>, item_id: u32, price: u64, name: String, symbol: String, uri: String) -> Result<()> {
        // 1. $EFFORT 토큰을 서버 금고로 전송 (기존 로직)
        let transfer_cpi = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.buyer.to_account_info(),
            },
        );
        token::transfer(transfer_cpi, price)?;

        // 2. 새로운 NFT 민트 계정 생성 및 초기화 (CPI)
        // (이 부분은 Anchor가 init 제약조건으로 처리)

        // 3. 사용자에게 새로 만든 NFT 1개 발행 (CPI)
        let mint_to_cpi = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.user_nft_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        token::mint_to(mint_to_cpi, 1)?;

        // 4. Metaplex를 호출하여 NFT 메타데이터 생성 (CPI)
        // ... (복잡한 Metaplex CPI 로직이 여기에 들어갑니다. 우선은 개념만 이해합니다.)
        
        // ... (구매 기록 로직은 그대로)
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
    pub buyer: Signer<'info>, // 구매자 (사용자)

    #[account(mut)]
    pub authority: Signer<'info>, // 아이템 발행 권한자 (서버 지갑)

    // --- $EFFORT 토큰 관련 계정 ---
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>, // 구매자의 $EFFORT 지갑
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>, // $EFFORT를 받을 서버 금고

    // --- 새로 발행할 NFT 관련 계정 ---
    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = authority,
        mint::freeze_authority = authority,
    )]
    pub nft_mint: Account<'info, Mint>, // NFT 민트 계정 (새로 생성)

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = nft_mint,
        associated_token::authority = buyer,
    )]
    pub user_nft_account: Account<'info, TokenAccount>, // NFT를 받을 사용자의 토큰 계정

    // --- Metaplex 관련 계정 ---
    /// CHECK: Metaplex metadata account
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,
    /// CHECK: Metaplex master edition account
    #[account(mut)]
    pub master_edition_account: AccountInfo<'info>,
    
    // --- 프로그램들 ---
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: Metaplex Token Metadata Program
    pub token_metadata_program: AccountInfo<'info>,
}


// 기존 LogEffort 구조체와 Context는 그대로 유지
#[account]
pub struct EffortLog {
    pub authority: Pubkey, // 생성 주체 (서버 지갑)
    pub user: Pubkey,      // 노력의 주체 (사용자)
    pub timestamp: i64,
    pub effort_data: String,
}

#[derive(Accounts)]
pub struct LogEffort<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 32 + 8 + 100)]
    pub log_account: Account<'info, EffortLog>,
    /// CHECK: This is the user who the effort is for. Not a signer.
    pub user: AccountInfo<'info>, // <--- Signer에서 AccountInfo로 변경
    #[account(mut)]
    pub authority: Signer<'info>, // <--- 서버 지갑(수수료 지불자)을 authority로 추가

    // ✅ --- 토큰 전송에 필요한 계정들 추가 ---
    #[account(mut)]
    pub mint: Account<'info, Mint>, // $EFFORT 토큰의 민트 계정

    #[account(
        mut,
        // 서버 금고 주소를 여기에 하드코딩하거나, 다른 방식으로 가져올 수 있습니다.
        // constraint = from_token_account.owner == authority.key()
    )]
    pub from_token_account: Account<'info, TokenAccount>, // 서버의 토큰 금고

    #[account(
        init_if_needed, // 사용자 토큰 계정이 없으면 새로 생성
        payer = authority,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub to_token_account: Account<'info, TokenAccount>, // 사용자의 토큰 계정

    // ✅ --- 시스템 프로그램들 추가 ---
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}